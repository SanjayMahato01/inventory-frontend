'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { LogOut, Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from './logo'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'
import type { RootState } from '@/lib/store'
import { useLogoutMutation } from '@/lib/features/api/authApi'
import { useCountLowStockProductsQuery } from '@/lib/features/api/productApi'

function getInitials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const user = useSelector((s: RootState) => s.auth.user)
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()

  // Live low-stock count (same cache entry as the sidebar)
  const { data: lowStockData } = useCountLowStockProductsQuery()
  const lowStockCount = lowStockData?.count ?? 0

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // onQueryStarted already dispatched clearUser
    } finally {
      setOpen(false)
      router.push('/login')
      router.refresh()
    }
  }

  const displayName = user?.name ?? user?.email ?? 'Account'
  const displayEmail = user?.email ?? ''
  const avatarText = user ? getInitials(user.name, user.email) : '··'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger >
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-4">
            <Logo />
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace
            </p>

            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              // 👇 resolve live count for items with a badgeKey
              const count =
                item.badgeKey === 'lowStock' ? lowStockCount : item.count ?? 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon data-icon="inline-start" />
                    {item.label}
                  </span>
                  {count > 0 ? (
                    <Badge
                      variant="destructive"
                      className="rounded-full px-2 py-0.5 text-[10px]"
                    >
                      {count}
                    </Badge>
                  ) : null}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-3">
            <Separator className="mb-3" />

            {/* Sign out */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <LogOut data-icon="inline-start" />
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>

            {/* User */}
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {avatarText}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                {displayEmail && (
                  <p className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}