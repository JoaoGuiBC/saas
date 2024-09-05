import { api } from '@/http/api-client'

interface ListOrganizationsResponse {
  organizations: Array<{
    id: string
    name: string
    slug: string
    avatarUrl: string | null
  }>
}

export async function listOrganizations() {
  const result = await api
    .get('organizations')
    .json<ListOrganizationsResponse>()

  return result
}
