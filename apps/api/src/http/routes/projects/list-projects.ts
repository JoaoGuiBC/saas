import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized_error'

const routeSchema = {
  tags: ['projects'],
  summary: 'List projects',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      projects: z.array(
        z.object({
          id: z.string().uuid(),
          description: z.string(),
          name: z.string(),
          slug: z.string(),
          avatarUrl: z.string().nullable(),
          organizationId: z.string(),
          ownerId: z.string(),
          createdAt: z.date(),
          owner: z.object({
            id: z.string().uuid(),
            name: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          }),
        }),
      ),
    }),
  },
}

export async function listProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/projects',
      { schema: routeSchema },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project'))
          throw new UnauthorizedError(
            "You're not allowed to see organization projects.",
          )

        const projects = await prisma.project.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            description: true,
            avatarUrl: true,
            organizationId: true,
            createdAt: true,
            owner: { select: { id: true, name: true, avatarUrl: true } },
          },
          where: { organizationId: organization.id },
          orderBy: { createdAt: 'desc' },
        })

        return reply.send({ projects })
      },
    )
}
