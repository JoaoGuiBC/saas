import { api } from '@/http/api-client'

interface SignUpRequest {
  name: string
  email: string
  password: string
}

type SignUpResponse = void

export async function signUp({
  name,
  email,
  password,
}: SignUpRequest): Promise<SignUpResponse> {
  await api.post('post', { json: { name, email, password } })
}
