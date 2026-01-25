'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import BouncyClick from '@/components/ui/bouncy-click';
import { apiClient } from '@/lib/api-client';
import { BookOpen, TrendingUp, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  async function loadDashboard() {
    try {
      const data = await apiClient.getMyEnrollments();
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {authLoading || isLoading ?
        <motion.div
          key="loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="container mx-auto p-6 space-y-6"
        >
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </motion.div> :
        <motion.div initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast} className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your learning
              </p>
            </div>
            <BouncyClick>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </BouncyClick>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrollments.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrollments.length > 0
                    ? Math.round(
                      enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) /
                      enrollments.length
                    )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Courses</h2>
            <AnimatePresence mode="wait">
              {enrollments.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={fade_out}
                  animate={normalize}
                  exit={fade_out_scale_1}
                  transition={transition_fast}
                >
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        You're not enrolled in any courses yet
                      </p>
                      <BouncyClick>
                        <Link href="/courses">
                          <Button>Browse Courses</Button>
                        </Link>
                      </BouncyClick>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="not-empty" initial={fade_out} animate={normalize} exit={fade_out_scale_1} transition={transition_fast} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {enrollments.map((enrollment) => (
                    <Card key={enrollment.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {enrollment.course?.title || 'Untitled Course'}
                          </CardTitle>
                          <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {enrollment.course?.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(enrollment.progressPercentage)}%</span>
                          </div>
                          <Progress value={enrollment.progressPercentage} />
                        </div>
                        <BouncyClick>
                          <Link href={`/courses/${enrollment.courseId}`}>
                            <Button className="w-full" variant="outline">
                              Continue Learning
                            </Button>
                          </Link>
                        </BouncyClick>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>}
    </AnimatePresence>
  );
}

