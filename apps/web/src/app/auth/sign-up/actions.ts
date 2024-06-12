'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { signUp } from '@/http/auth/sign-up'

const signUpSchema = z
  .object({
    name: z.string().refine((value) => value.split(' ').length > 1, {
      message: 'Por gentileza informe o seu nome completo.',
    }),
    email: z.string().email({ message: 'E-mail inválido.' }),
    password: z
      .string({ message: 'Senha inválida' })
      .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Confirmação de senha não está batendo.',
    path: ['password_confirmation'],
  })

export async function signUpAction(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { name, email, password } = result.data

  try {
    await signUp({
      name,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()

      return { success: false, message, errors: null }
    }

    console.error(error)
    return {
      success: false,
      message: 'Erro inesperado, tente novamente mais tarde.',
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
