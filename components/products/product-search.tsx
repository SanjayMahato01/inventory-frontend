'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ProductSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="w-full pl-9 sm:w-64"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    
    </div>
  )
}