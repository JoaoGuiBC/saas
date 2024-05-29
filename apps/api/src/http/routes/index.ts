import type { FastifyInstance } from 'fastify'

import { authenticateWithGithub } from './auth/authenticate-with-github'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getProfile } from './auth/get-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetPassword } from './auth/reset-password'

export async function routes(app: FastifyInstance) {
  app.register(authenticateWithGithub)
  app.register(authenticateWithPassword)
  app.register(createAccount)
  app.register(getProfile)
  app.register(requestPasswordRecover)
  app.register(resetPassword)
}
