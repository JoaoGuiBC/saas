import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const routeSchema = {
  tags: ['auth'],
  summary: 'Get authenticated user profile',
  response: {
    200: z.object({
      user: z.object({
        id: z.string().uuid(),
        name: z.string().nullable(),
        email: z.string().email(),
        avatarUrl: z.string().url().nullable(),
      }),
    }),
  },
}

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/profile', { schema: routeSchema }, async (request, reply) => {
      const userId = await request.getCurrentUserId()

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatarUrl: true },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      return reply.send({ user })
    })
}
