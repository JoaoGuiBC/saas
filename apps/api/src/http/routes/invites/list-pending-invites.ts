import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const routeSchema = {
  tags: ['invites'],
  summary: 'Retrieve pending invites',
  response: {
    200: z.object({
      invites: z.array(
        z.object({
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
      ),
    }),
  },
}

export async function listPendingInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/pending-invites', { schema: routeSchema }, async (request) => {
      const userId = await request.getCurrentUserId()

      const user = await prisma.user.findUnique({ where: { id: userId } })

      if (!user) throw new BadRequestError('User not found.')

      const invites = await prisma.invite.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          organization: { select: { name: true } },
        },
        where: { email: user.email },
      })

      return { invites }
    })
}
