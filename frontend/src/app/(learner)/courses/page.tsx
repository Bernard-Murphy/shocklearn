'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users, Plus, Edit, Trash2, BarChart, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { CreateCourseDialog } from '@/components/instructor/create-course-dialog';
import BouncyClick from '@/components/ui/bouncy-click';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  enrollmentCount?: number;
  instructor?: {
    firstName: string;
    lastName: string;
  };
}

export default function CourseCatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tab, setTab] = useState<'catalog' | 'teaching'>('catalog');
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [coursesData, enrollmentsData, instructorData] = await Promise.all([
        apiClient.getCourses({ status: 'published' }),
        apiClient.getMyEnrollments(),
        apiClient.getCourses({ instructorId: 'me' })
      ]);
      setCourses(coursesData.data || []);
      setEnrollments(enrollmentsData || []);
      setInstructorCourses(instructorData.data || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(courseId: string) {
    setEnrolling(courseId);
    try {
      await apiClient.enrollInCourse(courseId);
      await loadData();
      router.push(`/courses/${courseId}`);
    } catch (error: any) {
      setEnrolling(null);
      alert(error.message || 'Failed to enroll');
    }
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiClient.delete(`/courses/${courseId}`);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete course');
    }
  }

  function isEnrolled(courseId: string) {
    return enrollments.some((e) => e.courseId === courseId);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-2">Explore the catalog or manage your own courses</p>
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

      <Tabs value={tab} onValueChange={(value) => setTab(value as 'catalog' | 'teaching')} className="w-full">
        <TabsList>
          <BouncyClick>
            <TabsTrigger className="px-16 text-center" value="catalog">Course Catalog</TabsTrigger>
          </BouncyClick>
          <BouncyClick>
            <TabsTrigger className="px-16 text-center" value="teaching">My Teaching</TabsTrigger>
          </BouncyClick>
        </TabsList>

        <AnimatePresence mode="wait">
          {tab === 'catalog' && (
            <motion.div
              key="catalog"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
              className="mt-6"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={fade_out}
                    animate={normalize}
                    exit={fade_out_scale_1}
                    transition={transition_fast}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={fade_out}
                    animate={normalize}
                    exit={fade_out_scale_1}
                    transition={transition_fast}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {courses.map((course) => {
                      const enrolled = isEnrolled(course.id);
                      return (
                        <Card key={course.id} className="flex flex-col">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <BookOpen className="h-8 w-8 text-primary" />
                              <Badge variant={enrolled ? 'default' : 'outline'}>
                                {enrolled ? 'Enrolled' : 'Available'}
                              </Badge>
                            </div>
                            <CardTitle className="mt-4">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                            {course.instructor && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {course.instructor.firstName} {course.instructor.lastName}
                              </div>
                            )}
                            {enrolled ? (
                              <BouncyClick>
                                <Link href={`/courses/${course.id}`}>
                                  <Button className="w-full">Continue Learning</Button>
                                </Link>
                              </BouncyClick>
                            ) : (
                              <BouncyClick className="w-full">
                                <Button
                                  className="w-full"
                                  onClick={() => handleEnroll(course.id)}
                                  disabled={enrolling === course.id}
                                >
                                  {enrolling === course.id ? <>
                                    <Spinner size="sm" color="white" className="mr-2" />
                                    Enrolling
                                  </> : 'Enroll Now'}
                                </Button>
                              </BouncyClick>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
              {!loading && courses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No courses available</h3>
                  <p className="text-muted-foreground">Check back later for new courses</p>
                </div>
              )}
            </motion.div>
          )}
          {tab === 'teaching' && (
            <motion.div
              key="teaching"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
              className="mt-6"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="teaching-loading"
                    initial={fade_out}
                    animate={normalize}
                    exit={fade_out_scale_1}
                    transition={transition_fast}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="teaching-content"
                    initial={fade_out}
                    animate={normalize}
                    exit={fade_out_scale_1}
                    transition={transition_fast}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {instructorCourses.map((course) => (
                      <Card key={course.id} className="flex flex-col">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end space-y-4">
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
                  </motion.div>
                )}
              </AnimatePresence>
              {!loading && instructorCourses.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">You haven't created any courses</h3>
                  <p className="text-muted-foreground mb-6">Start sharing your knowledge today</p>
                  <BouncyClick>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Course
                    </Button>
                  </BouncyClick>
                </div>
              )}
            </motion.div>)}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

