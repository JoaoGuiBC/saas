import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { slugify } from '@/utils/slugfy'

import { UnauthorizedError } from '../_errors/unauthorized_error'

const routeSchema = {
  tags: ['projects'],
  summary: 'Create a new project',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    name: z.string(),
    description: z.string(),
  }),
  response: {
    201: z.object({
      projectId: z.string(),
    }),
  },
}

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/projects',
      { schema: routeSchema },
      async (request, reply) => {
        const { slug } = request.params
        const { name, description } = request.body

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Project'))
          throw new UnauthorizedError(
            "You're not allowed to create new projects.",
          )

        const project = await prisma.project.create({
          data: {
            name,
            slug: slugify(name),
            description,
            organizationId: organization.id,
            ownerId: userId,
          },
        })

        return reply.status(201).send({ projectId: project.id })
      },
    )
}
