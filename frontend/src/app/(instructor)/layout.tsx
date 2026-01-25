'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Home, LogOut, Sparkles, BarChart3 } from 'lucide-react';
import { UserRole } from '@edtech/shared';
import BouncyClick from '@/components/ui/bouncy-click';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-lg">EdTech LMS</span>
        </div>

        <Separator />

        <nav className="space-y-2">
          <BouncyClick>
            <Link href="/instructor">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </BouncyClick>
          <BouncyClick>
            <Link href="/instructor/courses">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                My Courses
              </Button>
            </Link>
          </BouncyClick>
          <BouncyClick>
            <Link href="/instructor/analytics">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </BouncyClick>
        </nav>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2">
            <Avatar>
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <BouncyClick>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </BouncyClick>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}

