'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { Logo } from './logo';
import { navItems } from '@/lib/nav';
import { cn } from '@/lib/utils';
import type { RootState } from '@/lib/store';
import { useLogoutMutation } from '@/lib/features/api/authApi';
import { useCountLowStockProductsQuery } from '@/lib/features/api/productApi';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function getInitials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useSelector((s: RootState) => s.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // 👇 live low-stock count (shared with the low-stock page — same cache entry)
  const { data: lowStockData } = useCountLowStockProductsQuery();
  const lowStockCount = lowStockData?.count ?? 0;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // onQueryStarted already dispatched clearUser
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const displayName = user?.name ?? user?.email ?? 'Account';
  const displayEmail = user?.email ?? '';
  const avatarText = user ? getInitials(user.name, user.email) : '··';

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'hidden h-screen shrink-0 border-r bg-card lg:sticky lg:top-0 lg:flex lg:flex-col',
          'transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <div
          className={cn(
            'flex h-20 items-center',
            collapsed ? 'justify-center px-2' : 'justify-between px-6',
          )}
        >
          {collapsed ? (
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-4.5-2.7a2 2 0 0 0-2.06 0z" />
                <path d="m7 16.5-4.74-2.85" />
                <path d="m7 16.5 5-3" />
                <path d="M7 16.5v5.17" />
                <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5z" />
                <path d="m17 16.5-5-3" />
                <path d="m17 16.5 4.74-2.85" />
                <path d="M17 16.5v5.17" />
                <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z" />
                <path d="M12 8 7.26 5.15" />
                <path d="m12 8 4.74-2.85" />
                <path d="M12 13.5V8" />
              </svg>
            </div>
          ) : (
            <>
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronsLeft className="size-4" />
              </Button>
            </>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label="Expand sidebar"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        )}

        <div className={cn('py-2', collapsed ? 'px-2' : 'px-3')}>
          {!collapsed && (
            <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              // 👇 resolve live count for items with a badgeKey
              const count =
                item.badgeKey === 'lowStock'
                  ? lowStockCount
                  : item.count ?? 0;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center rounded-lg text-sm font-medium transition-colors',
                    collapsed
                      ? 'justify-center px-0 py-2.5'
                      : 'justify-between px-3 py-2.5',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center',
                      collapsed ? 'justify-center' : 'gap-3',
                    )}
                  >
                    <Icon data-icon="inline-start" />
                    {!collapsed && item.label}
                  </span>
                  {!collapsed && count > 0 && (
                    <Badge
                      variant="destructive"
                      className="rounded-full px-2 py-0.5 text-[10px]"
                    >
                      {count}
                    </Badge>
                  )}
                  {collapsed && count > 0 && (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                  )}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger >{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {count > 0 && (
                      <Badge
                        variant="destructive"
                        className="rounded-full px-1.5 py-0 text-[10px]"
                      >
                        {count}
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{linkContent}</div>
              );
            })}
          </nav>
        </div>

        <div className={cn('mt-auto', collapsed ? 'p-2' : 'p-4')}>
          <Separator className={cn(collapsed ? 'mb-2' : 'mb-4')} />

          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-label="Sign out"
                    className="size-9 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger >
                  <Avatar className="size-9 cursor-pointer">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {avatarText}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{displayName}</p>
                  {displayEmail && (
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <LogOut data-icon="inline-start" />
                {isLoggingOut ? 'Signing out…' : 'Sign out'}
              </button>

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
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}