import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const routeSchema = {
  tags: ['auth'],
  summary: 'Request e-mail to reset password',
  body: z.object({
    email: z.string().email(),
  }),
  response: {
    201: z.null(),
  },
}

export async function requestPasswordRecover(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/password/recover',
      { schema: routeSchema },
      async (request, reply) => {
        const { email } = request.body

        const userFromEmail = await prisma.user.findUnique({
          where: { email },
        })

        if (!userFromEmail) return reply.status(201)

        const { id: code } = await prisma.token.create({
          data: { type: 'PASSWORD_RECOVER', userId: userFromEmail.id },
        })

        console.log(`Recover password token: ${code}`)

        return reply.status(201).send()
      },
    )
}
