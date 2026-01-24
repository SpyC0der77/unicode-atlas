'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface ActionDropdownProps {
  actions: {
    label: string
    id: string
  }[]
  onAction?: (actionId: string) => void
  label?: string
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
}

export function ActionDropdown({ actions, onAction, label = "Actions", size = "default" }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (actionId: string) => {
    onAction?.(actionId)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="gap-2">
          {label}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => handleAction(action.id)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
