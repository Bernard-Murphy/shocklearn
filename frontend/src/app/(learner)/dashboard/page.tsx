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
import { BookOpen, TrendingUp, Clock, Plus, Users, BarChart, Edit, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1, transition } from '@/lib/transitions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateCourseDialog } from '@/components/instructor/create-course-dialog';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tab, setTab] = useState<'learning' | 'teaching'>('learning');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  async function loadDashboard() {
    try {
      const [enrollmentsData, coursesData] = await Promise.all([
        apiClient.getMyEnrollments(),
        apiClient.getCourses({ instructorId: 'me' })
      ]);
      setEnrollments(enrollmentsData);
      setInstructorCourses(coursesData.data || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiClient.delete(`/courses/${courseId}`);
      await loadDashboard();
    } catch (error: any) {
      alert(error.message || 'Failed to delete course');
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your teaching and learning in one place
          </p>
        </div>
        <BouncyClick>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </BouncyClick>
      </div>

      <CreateCourseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as 'learning' | 'teaching')} className="w-full">
        <TabsList>
          <BouncyClick>
            <TabsTrigger className="px-16 text-center" value="learning">Learning</TabsTrigger>
          </BouncyClick>
          <BouncyClick>
            <TabsTrigger className="px-16 text-center" value="teaching">
              Teaching
            </TabsTrigger>
          </BouncyClick>
        </TabsList>

        <AnimatePresence mode="wait">
          {tab === 'learning' && (
            <motion.div
              key="learning"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition}
              className="space-y-6 mt-6"
            >
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
                <h2 className="text-2xl font-bold">Your Enrolled Courses</h2>
                {enrollments.length === 0 ? (
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
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                          <CardDescription className="line-clamp-2">
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
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {tab === 'teaching' && (
            <motion.div
              key="teaching"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition}
              className="space-y-6 mt-6"
            >
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{instructorCourses.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {instructorCourses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
                    </div>
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
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Created Courses</h2>
                  <BouncyClick>
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Course
                    </Button>
                  </BouncyClick>
                </div>
                {instructorCourses.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground mb-4">You haven't created any courses yet</p>
                      <BouncyClick>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Course
                        </Button>
                      </BouncyClick>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {instructorCourses.map((course) => (
                      <Card key={course.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <BouncyClick>
                              <Link href={`/instructor/courses/${course.id}/edit`} className="w-full">
                                <Button className="w-full" variant="outline" size="sm">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                            </BouncyClick>
                            <BouncyClick>
                              <Link href={`/instructor/courses/${course.id}/analytics`} className="w-full">
                                <Button className="w-full" variant="outline" size="sm">
                                  <BarChart className="mr-2 h-4 w-4" />
                                  Analytics
                                </Button>
                              </Link>
                            </BouncyClick>
                            <BouncyClick>
                              <Link href={`/instructor/courses/${course.id}/ai-tools`} className="w-full">
                                <Button className="w-full" variant="outline" size="sm">
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  AI Tools
                                </Button>
                              </Link>
                            </BouncyClick>
                            <BouncyClick>
                              <Button
                                className="w-full text-destructive hover:text-destructive"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </BouncyClick>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

