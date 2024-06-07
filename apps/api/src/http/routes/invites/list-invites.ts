import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized_error'

const routeSchema = {
  tags: ['invites'],
  summary: 'List organization invites',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      invites: z.array(
        z.object({
          email: z.string(),
          role: roleSchema,
          id: z.string(),
          createdAt: z.date(),
          author: z
            .object({
              id: z.string(),
              name: z.string().nullable(),
            })
            .nullable(),
        }),
      ),
    }),
  },
}

export async function listInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/invites',
      { schema: routeSchema },
      async (request) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project'))
          throw new UnauthorizedError(
            "You're not allowed to view organization invites.",
          )

        const invites = await prisma.invite.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: { select: { id: true, name: true } },
          },
          where: { organizationId: organization.id },
          orderBy: { createdAt: 'desc' },
        })

        return { invites }
      },
    )
}
