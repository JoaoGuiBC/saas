import { FormEvent, useState, useTransition } from 'react'

interface FormSate {
  success: boolean
  message: string | null
  errors: Record<string, string[]> | null
}

export function useFormState(
  action: (data: FormData) => Promise<FormSate>,
  onSuccess?: () => Promise<void> | void,
  initialState?: FormSate,
) {
  const [formState, setFormState] = useState(
    initialState ?? { success: false, message: null, errors: null },
  )

  const [isPending, startTransition] = useTransition()

  async function handleAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const result = await action(data)

      if (result.success === true && onSuccess) await onSuccess()

      setFormState(result)
    })
  }

  return [formState, handleAction, isPending] as const
}
