'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Home, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import BouncyClick from '@/components/ui/bouncy-click';

function LearnerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
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
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </BouncyClick>
          <BouncyClick>
            <Link href="/courses">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                My Courses
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

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LearnerShell>{children}</LearnerShell>
    </AuthProvider>
  );
}

