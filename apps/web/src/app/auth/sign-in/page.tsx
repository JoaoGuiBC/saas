import Image from 'next/image'
import Link from 'next/link'

import GithubMark from '@/assets/github-mark.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { signInWithAndPassword } from './actions'

export default function SignInPage() {
  return (
    <form action={signInWithAndPassword} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input name="email" type="email" id="email" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <Input name="password" type="password" id="password" />

        <Link
          href="/auth/forgot-password"
          className="text-xs font-medium text-foreground hover:underline"
        >
          Esqueceu a sua senha?
        </Link>
      </div>

      <Button type="submit" className="w-full">
        Entrar com e-mail
      </Button>

      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-up">Criar uma nova conta</Link>
      </Button>

      <Separator />

      <Button type="submit" variant="outline" className="w-full">
        <Image src={GithubMark} className="mr-2 size-4 dark:invert" alt="" />
        Entrar com Github
      </Button>
    </form>
  )
}
