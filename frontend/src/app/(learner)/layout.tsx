'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Home, LogOut, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@edtech/shared';
import BouncyClick from '@/components/ui/bouncy-click';
import Spinner from '@/components/ui/spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/page-transition';
import { CreateCourseDialog } from '@/components/instructor/create-course-dialog';

function LearnerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
          <aside className="w-64 border-r bg-card p-6 flex flex-col ">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-lg">ShockLearn LMS</span>
            </div>

            <Separator className="mb-6" />

            <nav className="space-y-2 flex-1">
              <BouncyClick>
                <Link href="/dashboard">
                  <Button variant="ghost" className={cn("w-full justify-start", pathname === '/dashboard' ? 'bg-accent text-accent-foreground' : '')}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </BouncyClick>
              <BouncyClick>
                <Link href="/courses">
                  <Button variant="ghost" className={cn("w-full justify-start", pathname === '/courses' ? 'bg-accent text-accent-foreground' : '')}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Courses
                  </Button>
                </Link>
              </BouncyClick>
            </nav>

            <CreateCourseDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center space-x-3 px-3 pb-2">
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
              <Separator className="my-6" />
              <BouncyClick>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </BouncyClick>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">
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
    <LearnerShell>{children}</LearnerShell>
  );
}

