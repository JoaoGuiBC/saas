import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'

const routeSchema = {
  tags: ['orgs'],
  summary: 'List organiztions where user is member',
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      organizations: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          slug: z.string(),
          avatarUrl: z.string().url().nullable(),
          role: roleSchema,
        }),
      ),
    }),
  },
}

export async function listOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations', { schema: routeSchema }, async (request) => {
      const userId = await request.getCurrentUserId()

      const organizations = await prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          members: { select: { role: true }, where: { userId } },
        },
        where: { members: { some: { userId } } },
      })

      const organizationsWithUserRole = organizations.map(
        ({ members, ...org }) => ({ ...org, role: members[0].role }),
      )

      return { organizations: organizationsWithUserRole }
    })
}
