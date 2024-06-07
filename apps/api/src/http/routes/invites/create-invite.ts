import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middleware/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized_error'

const routeSchema = {
  tags: ['invites'],
  summary: 'Create a new invite',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    email: z.string().email(),
    role: roleSchema,
  }),
  response: {
    201: z.object({
      inviteId: z.string(),
    }),
  },
}

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/invites',
      { schema: routeSchema },
      async (request, reply) => {
        const { slug } = request.params
        const { email, role } = request.body

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Invite'))
          throw new UnauthorizedError(
            "You're not allowed to create new invites.",
          )

        const [_, domain] = email

        if (
          organization.shouldAttachUsersByDomain &&
          organization.domain === domain
        ) {
          throw new BadRequestError(
            `Users with "${domain}" domain will join your organization automatically on login.`,
          )
        }

        const inviteWithSameEmail = await prisma.invite.findUnique({
          where: {
            email_organizationId: { email, organizationId: organization.id },
          },
        })

        if (inviteWithSameEmail)
          throw new BadRequestError(
            'Another invite for same e-mail already exists.',
          )

        const memberWithSameEmail = await prisma.member.findFirst({
          where: { organizationId: organization.id, user: { email } },
        })

        if (memberWithSameEmail)
          throw new BadRequestError(
            'There is already a member with this email in your organization.',
          )

        const invite = await prisma.invite.create({
          data: {
            email,
            role,
            organizationId: organization.id,
            authorId: userId,
          },
        })

        return reply.status(201).send({ inviteId: invite.id })
      },
    )
}
