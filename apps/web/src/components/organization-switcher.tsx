import { ChevronsUpDown, PlusCircle } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function OrganizationSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span className="text-muted-foreground">Selecionar organização</span>
        <ChevronsUpDown className="ml-1 size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        alignOffset={-16}
        sideOffset={12}
        className="w-[200px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizações</DropdownMenuLabel>

          <DropdownMenuItem>
            <Avatar className="mr-2 size-4">
              <AvatarImage src="" />
              <AvatarFallback />
            </Avatar>

            <span className="line-clamp-1">Organização 1</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/create-organization">
            <PlusCircle className="mr-2 size-4" />
            Criar organização
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
