'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { UserRole } from '@edtech/shared';
import { Plus, BookOpen, Users, BarChart } from 'lucide-react';
import BouncyClick from '@/components/ui/bouncy-click';
import Spinner from '@/components/ui/spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

export default function InstructorDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        router.push('/dashboard');
      } else {
        loadCourses();
      }
    }
  }, [user, authLoading, router]);

  async function loadCourses() {
    try {
      const response = await apiClient.getCourses({ instructorId: user?.id });
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {authLoading || isLoading ? (
        <motion.div
          key="instructor-dashboard-loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="flex min-h-[400px] items-center justify-center"
        >
          <Spinner color="dark" />
        </motion.div>
      ) : (
        <motion.div
          key="instructor-dashboard-content"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="container mx-auto p-6 space-y-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
              <p className="text-muted-foreground">Manage your courses and content</p>
            </div>
            <BouncyClick>
              <Link href="/instructor/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            </BouncyClick>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Courses</h2>
            {courses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any courses yet</p>
                  <BouncyClick>
                    <Link href="/instructor/courses/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Course
                      </Button>
                    </Link>
                  </BouncyClick>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </div>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <BouncyClick>
                        <Link href={`/instructor/courses/${course.id}/edit`}>
                          <Button className="w-full" variant="outline">
                            Edit Course
                          </Button>
                        </Link>
                      </BouncyClick>
                      <BouncyClick>
                        <Link href={`/instructor/courses/${course.id}/ai-tools`}>
                          <Button className="w-full" variant="outline">
                            AI Tools
                          </Button>
                        </Link>
                      </BouncyClick>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

