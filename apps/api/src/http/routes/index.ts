import type { FastifyInstance } from 'fastify'

import { authenticateWithGithub } from './auth/authenticate-with-github'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getProfile } from './auth/get-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetPassword } from './auth/reset-password'
import { createOrganization } from './orgs/create-organization'
import { getUserMembership } from './orgs/get-membership'
import { getOrganization } from './orgs/get-organization'
import { listOrganizations } from './orgs/list-organizations'
import { shutdownOrganization } from './orgs/shutdown-organization'
import { tranferOrganization } from './orgs/transfer-organization'
import { updateOrganization } from './orgs/update-organization'
import { createProject } from './projects/create-project'
import { deleteProject } from './projects/delete-project'
import { listProjects } from './projects/list-projects'
import { updateProject } from './projects/update-project'

export async function routes(app: FastifyInstance) {
  /** Auth related routes */
  app.register(authenticateWithGithub)
  app.register(authenticateWithPassword)
  app.register(createAccount)
  app.register(getProfile)
  app.register(requestPasswordRecover)
  app.register(resetPassword)

  /** Organizations related routes */
  app.register(createOrganization)
  app.register(getUserMembership)
  app.register(getOrganization)
  app.register(listOrganizations)
  app.register(shutdownOrganization)
  app.register(tranferOrganization)
  app.register(updateOrganization)

  /** Projects related routes */
  app.register(createProject)
  app.register(deleteProject)
  app.register(listProjects)
  app.register(updateProject)
}
