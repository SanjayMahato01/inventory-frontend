import { Boxes } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Boxes data-icon="inline-start" />
      </div>
      <span className="text-lg font-semibold tracking-tight">Inventory</span>
    </div>
  )
}