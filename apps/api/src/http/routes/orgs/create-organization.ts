import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/utils/slugfy'

import { BadRequestError } from '../_errors/bad-request-error'

const routeSchema = {
  tags: ['orgs'],
  summary: 'Create a new organization',
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string(),
    domain: z.string().optional(),
    shouldAttachUsersByDomain: z.boolean().optional(),
  }),
  response: {
    201: z.object({
      organizationId: z.string(),
    }),
  },
}

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations', { schema: routeSchema }, async (request, reply) => {
      const userId = await request.getCurrentUserId()

      const { name, domain, shouldAttachUsersByDomain } = request.body

      if (domain) {
        const organizationBodyDomain = await prisma.organization.findUnique({
          where: { domain },
        })

        if (organizationBodyDomain)
          throw new BadRequestError(
            'Another organization with same domain already exists.',
          )
      }

      const organization = await prisma.organization.create({
        data: {
          name,
          slug: slugify(name),
          domain,
          shouldAttachUsersByDomain,
          ownerId: userId,

          members: { create: { userId, role: 'ADMIN' } },
        },
      })

      return reply.status(201).send({ organizationId: organization.id })
    })
}
