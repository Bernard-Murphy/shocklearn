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
import { BookOpen, TrendingUp, Clock, Plus, Users, BarChart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);
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
      const [enrollmentsData, coursesData] = await Promise.all([
        apiClient.getMyEnrollments(),
        apiClient.getCourses({ instructorId: user?.id })
      ]);
      setEnrollments(enrollmentsData);
      setInstructorCourses(coursesData.data || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
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

  const isInstructor = instructorCourses.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {isInstructor 
              ? "Manage your teaching and learning in one place" 
              : "Here's what's happening with your learning"}
          </p>
        </div>
        <div className="flex gap-4">
          {isInstructor && (
            <BouncyClick>
              <Link href="/instructor/courses/new">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            </BouncyClick>
          )}
          <BouncyClick>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </BouncyClick>
        </div>
      </div>

      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="teaching" disabled={!isInstructor && instructorCourses.length === 0}>
            Teaching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="space-y-6 mt-6">
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
        </TabsContent>

        <TabsContent value="teaching" className="space-y-6 mt-6">
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
                <Link href="/instructor/courses/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Course
                  </Button>
                </Link>
              </BouncyClick>
            </div>
            {instructorCourses.length === 0 ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

