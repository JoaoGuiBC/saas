import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBER', id: 'user-id' })

const userCanInviteSomeoneElse = ability.can('get', 'User')
const userCanDeleteOtherUsers = ability.can('delete', 'User')

const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(userCanInviteSomeoneElse)
console.log(userCanDeleteOtherUsers)

console.log(userCannotDeleteOtherUsers)
