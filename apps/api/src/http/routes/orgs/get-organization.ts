import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'

const routeSchema = {
  tags: ['orgs'],
  summary: 'Get organization details',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      organization: z.object({
        id: z.string().uuid(),
        name: z.string(),
        slug: z.string(),
        domain: z.string().nullable(),
        shouldAttachUsersByDomain: z.boolean(),
        avatarUrl: z.string().url().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
        ownerId: z.string().uuid(),
      }),
    }),
  },
}

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:slug', { schema: routeSchema }, async (request) => {
      const { slug } = request.params

      const { organization } = await request.getUserMembership(slug)

      return { organization }
    })
}
