import {
  LayoutDashboard,
  Package,
  ArrowUpFromLine,
  AlertTriangle,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  count?: number;
  badgeKey?: 'lowStock'; // 👈 add this
};

export const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Transactions', href: '/transactions', icon: ArrowUpFromLine },
  {
    label: 'Low stock',
    href: '/low-stock',
    icon: AlertTriangle,
    badgeKey: 'lowStock',
  },
];