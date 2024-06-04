import { defineAbilityFor, Role, userSchema } from '@saas/auth'

/**
 * Returns a set of functions to test user permissions
 *
 * @param userId - ID of the user
 * @param role - the role of the user in some organization
 */
export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({ id: userId, role })

  const ability = defineAbilityFor(authUser)

  return ability
}
