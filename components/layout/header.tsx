'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Maximize2, Minimize2, Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MobileNav } from './mobile-nav'
import { Logo } from './logo'
import { navItems } from '@/lib/nav'

export function Header() {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const currentLabel =
    navItems.find((item) => item.href === pathname)?.label ?? 'Dashboard'

  const toggleTheme = () => {
    const next = !darkMode
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    setDarkMode(next)
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen?.()
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b bg-card px-3 py-2 sm:h-20 sm:px-8 sm:py-0">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-medium text-foreground">{currentLabel}</span>
        </div>
        <div className="sm:hidden">
          <Logo />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
        >
          {darkMode ? <Sun /> : <Moon />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
        <Separator orientation="vertical" className="mx-2 h-6" />
   
      </div>
    </header>
  )
}