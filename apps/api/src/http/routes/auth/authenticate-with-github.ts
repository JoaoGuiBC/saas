import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const routeSchema = {
  tags: ['auth'],
  summary: 'Authenticate using github OAuth',
  body: z.object({
    code: z.string(),
  }),
  response: {
    201: z.object({ token: z.string() }),
  },
}

export async function authenticateWithGithub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/sessions/github',
      { schema: routeSchema },
      async (request, reply) => {
        const { code } = request.body

        const githubOAuthUrl = new URL(
          'https://github.com/login/oauth/access_token',
        )

        githubOAuthUrl.searchParams.append('code', code)
        githubOAuthUrl.searchParams.append(
          'client_id',
          env.GITHUB_OAUTH_CLIENT_ID,
        )
        githubOAuthUrl.searchParams.append(
          'client_secret',
          env.GITHUB_OAUTH_CLIENT_SECRET,
        )
        githubOAuthUrl.searchParams.append(
          'redirect_uri',
          env.GITHUB_OAUTH_CLIENT_REDIRECT_URI,
        )

        const githubAccessTokenReponse = await fetch(githubOAuthUrl, {
          method: 'POST',
          headers: { Accept: 'application/json' },
        })

        const githubAccessTokenData = await githubAccessTokenReponse.json()

        const { access_token: githubAccessToken } = z
          .object({
            access_token: z.string(),
            token_type: z.literal('bearer'),
            scope: z.string(),
          })
          .parse(githubAccessTokenData)

        const githubUserResponse = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${githubAccessToken}` },
        })

        const githubUserData = await githubUserResponse.json()

        const {
          id: githubProviderId,
          avatar_url: avatarUrl,
          name,
          email,
        } = z
          .object({
            id: z.number().int().transform(String),
            avatar_url: z.string().url(),
            name: z.string().nullable(),
            email: z.string().nullable(),
          })
          .parse(githubUserData)

        if (email === null)
          throw new BadRequestError(
            'Your Github account must have an e-mail to authenticate.',
          )

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          user = await prisma.user.create({
            data: { name, email, avatarUrl },
          })
        }

        let account = await prisma.account.findUnique({
          where: { provider_userId: { provider: 'GITHUB', userId: user.id } },
        })

        if (!account) {
          account = await prisma.account.create({
            data: {
              provider: 'GITHUB',
              providerAccountId: githubProviderId,
              userId: user.id,
            },
          })
        }

        const token = await reply.jwtSign(
          { sub: user.id },
          { sign: { expiresIn: '7d' } },
        )

        return reply.status(201).send({ token })
      },
    )
}
