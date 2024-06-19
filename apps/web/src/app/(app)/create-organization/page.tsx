import { OrganizationForm } from './organization-form'

export default function CreateOrganization() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Criar organização</h1>

      <OrganizationForm />
    </div>
  )
}
