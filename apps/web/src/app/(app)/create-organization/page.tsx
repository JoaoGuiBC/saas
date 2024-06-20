import { Header } from '@/components/header'

import { OrganizationForm } from './organization-form'

export default function CreateOrganization() {
  return (
    <div className="spcace-y-4 py-4">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] space-y-4">
        <h1 className="text-2xl font-bold">Criar organização</h1>

        <OrganizationForm />
      </main>
    </div>
  )
}
