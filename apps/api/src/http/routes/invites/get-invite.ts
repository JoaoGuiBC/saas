import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const routeSchema = {
  tags: ['invites'],
  summary: 'Get an invite',
  params: z.object({
    inviteId: z.string(),
  }),
  response: {
    201: z.object({
      invite: z.object({
        email: z.string(),
        role: roleSchema,
        organization: z.object({
          name: z.string(),
        }),
        id: z.string(),
        createdAt: z.date(),
        author: z
          .object({
            id: z.string(),
            name: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          })
          .nullable(),
      }),
    }),
  },
}

export async function getInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/invites/:inviteId', { schema: routeSchema }, async (request) => {
      const { inviteId } = request.params

      const invite = await prisma.invite.findUnique({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          organization: { select: { name: true } },
        },
        where: { id: inviteId },
      })

      if (!invite) throw new BadRequestError(`Invite not found.`)

      return { invite }
    })
}
