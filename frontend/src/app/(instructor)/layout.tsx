'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import BouncyClick from '@/components/ui/bouncy-click';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';
import { PageTransition } from '@/components/ui/page-transition';
import { InstructorSidebar } from '@/components/instructor/instructor-sidebar';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setTimeout(async () => {
      await logout();
    }, 250);
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading || !user || isLoggingOut ? (
        <motion.div
          key="loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="flex min-h-screen items-center justify-center"
        />
      ) : (
        <motion.div
          className="flex min-h-screen"
          key="content"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
        >
          <div className="fixed inset-y-0 flex w-64 flex-col">
            <InstructorSidebar />
            
            <div className="mt-auto p-6 border-t bg-card">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <BouncyClick>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </BouncyClick>
            </div>
          </div>

          <main className="flex-1 ml-64 overflow-y-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
