'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  instructor?: {
    firstName: string;
    lastName: string;
  };
}

export default function CourseCatalogPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        apiClient.getCourses({ status: 'published' }),
        apiClient.getMyEnrollments(),
      ]);
      setCourses(coursesData.data || []);
      setEnrollments(enrollmentsData || []);
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

  function isEnrolled(courseId: string) {
    return enrollments.some((e) => e.courseId === courseId);
  }


  return (
    <AnimatePresence mode="wait">
      {loading ?
        <motion.div
          key="loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="p-8 space-y-6"
        >
          <div className="p-8 space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </motion.div> :
        <motion.div
          key="content"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="p-8 space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold">Course Catalog</h1>
            <p className="text-muted-foreground mt-2">Browse and enroll in available courses</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                      >
                        {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No courses available</h3>
              <p className="text-muted-foreground">Check back later for new courses</p>
            </div>
          )}
        </motion.div>}
    </AnimatePresence>
  );
}

