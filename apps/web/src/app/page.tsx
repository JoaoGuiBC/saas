import { auth } from '@/auth/auth'

export default async function Home() {
  const { user } = await auth()

  return <h1>{user.name}</h1>
}
