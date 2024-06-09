import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized_error'

const routeSchema = {
  tags: ['members'],
  summary: 'List organization members',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      members: z.array(
        z.object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          name: z.string().nullable(),
          email: z.string(),
          avatarUrl: z.string().url().nullable(),
          role: roleSchema,
        }),
      ),
    }),
  },
}

export async function listMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members',
      { schema: routeSchema },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User'))
          throw new UnauthorizedError(
            "You're not allowed to see organization members.",
          )

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          where: { organizationId: organization.id },
          orderBy: { role: 'asc' },
        })

        const membersWithRole = members.map(
          ({ user: { id: userId, ...user }, ...member }) => ({
            ...member,
            ...user,
            userId,
          }),
        )

        return reply.send({ members: membersWithRole })
      },
    )
}
