'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
        </nav>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}

