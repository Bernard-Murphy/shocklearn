'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Home, LogOut, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { UserRole } from '@edtech/shared';
import BouncyClick from '@/components/ui/bouncy-click';
import Spinner from '@/components/ui/spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

import { PageTransition } from '@/components/ui/page-transition';

function LearnerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setTimeout(async () => {
      await logout();
      // router.push('/');
    }, 250);

  }

  return (
    <AnimatePresence mode="wait">
      {isLoading || !user || isLoggingOut ?
        <motion.div
          key="loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="flex min-h-screen items-center justify-center"
        >
          {/* <Spinner color="dark" /> */}
        </motion.div> :
        <motion.div
          className="flex min-h-screen"
          key="content"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
        >
          <aside className="w-64 border-r bg-card p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-lg">ShockLearn LMS</span>
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

              <Separator className="my-2" />

              <BouncyClick>
                <Link href="/instructor">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Switch to Teaching
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

          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
        </motion.div>}
    </AnimatePresence>

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

