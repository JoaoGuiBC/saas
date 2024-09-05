import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'

const routeSchema = {
  tags: ['orgs'],
  summary: 'Get user membership on organization',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    202: z.object({
      membership: z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        role: roleSchema,
        organizationId: z.string().uuid(),
      }),
    }),
  },
}

export async function getUserMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/membership',
      { schema: routeSchema },
      async (request) => {
        const { slug } = request.params

        const {
          membership: { id, role, organizationId, userId },
        } = await request.getUserMembership(slug)

        return { membership: { id, userId, role, organizationId } }
      },
    )
}
