'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, CheckCircle, Circle, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';
import BouncyClick from '@/components/ui/bouncy-click';

interface Lesson {
  id: string;
  title: string;
  estimatedDurationMinutes: number;
  orderIndex: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    try {
      const [courseData, enrollmentsData] = await Promise.all([
        apiClient.getCourse(courseId),
        apiClient.getMyEnrollments(),
      ]);
      const modules = await Promise.all(
        (courseData.modules || []).map(async (m: any) => {
          const lessons = await apiClient.getLessonsByModule(m.id);
          return { ...m, lessons: lessons || [] };
        }),
      );

      setCourse({ ...courseData, modules });

      const enrollmentForCourse = enrollmentsData.find((e: any) => e.courseId === courseId);
      setEnrollment(enrollmentForCourse);

      if (enrollmentForCourse) {
        const progressData = await apiClient.getEnrollmentProgress(enrollmentForCourse.id);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  }

  function getLessonStatus(lessonId: string) {
    if (!progress) return 'not_started';
    const lessonProgress = progress.lessonsProgress.find((lp: any) => lp.lessonId === lessonId);
    return lessonProgress?.status || 'not_started';
  }

  return (
    <AnimatePresence mode="wait">
      {loading ?
        <motion.div
          className="p-8 space-y-6"
          key="loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
        >
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </motion.div> :
        <motion.div
          key="content"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
        >
          <AnimatePresence mode="wait">
            {course ?
              <motion.div
                key="course"
                initial={fade_out}
                animate={normalize}
                exit={fade_out_scale_1}
                transition={transition_fast}
              >
                <div className="p-8 space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground mt-2">{course.description}</p>
                  </div>
                  <AnimatePresence mode="wait">
                    {enrollment && progress && (
                      <motion.div
                        key={String(enrollment && progress)}
                        initial={fade_out}
                        animate={normalize}
                        exit={fade_out_scale_1}
                        transition={transition_fast}
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>Your Progress</CardTitle>
                            <CardDescription>
                              {progress.completedLessons} of {progress.totalLessons} lessons completed
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Progress value={progress.progressPercentage} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-2">{progress.progressPercentage}%</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>


                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Course Content</h2>
                    <Accordion type="multiple" className="space-y-2">
                      {course.modules.map((module) => (
                        <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex flex-col items-start text-left">
                              <span className="font-semibold">{module.title}</span>
                              <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {module.lessons.map((lesson) => {
                                const status = getLessonStatus(lesson.id);
                                const isCompleted = status === 'completed';
                                const isInProgress = status === 'in_progress';

                                return (
                                  <Link
                                    key={lesson.id}
                                    href={enrollment ? `/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}` : '#'}
                                    className={`flex items-center justify-between p-3 rounded-md transition-colors ${enrollment ? 'hover:bg-muted cursor-pointer' : 'cursor-not-allowed opacity-50'
                                      }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      ) : isInProgress ? (
                                        <Circle className="h-5 w-5 text-blue-500" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                      )}
                                      <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {lesson.estimatedDurationMinutes}m
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <AnimatePresence mode="wait">
                    {!enrollment && (
                      <motion.div
                        key="enroll"
                        initial={fade_out}
                        animate={normalize}
                        exit={fade_out_scale_1}
                        transition={transition_fast}
                      >
                        <Card className="border-primary">
                          <CardContent className="pt-6 text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-primary" />
                            <div>
                              <h3 className="font-semibold text-lg">Enroll to Access Course Content</h3>
                              <p className="text-muted-foreground">Start learning by enrolling in this course</p>
                            </div>
                            <BouncyClick>
                              <Button
                                onClick={async () => {
                                  await apiClient.enrollInCourse(courseId);
                                  await loadData();
                                }}
                              >
                                Enroll Now
                              </Button>
                            </BouncyClick>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div> :
              <motion.div
                key="no-course"
                className="p-8"
                initial={fade_out}
                animate={normalize}
                exit={fade_out_scale_1}
                transition={transition_fast}
              >
                <p>Course not found</p>
              </motion.div>}
          </AnimatePresence>
        </motion.div>}
    </AnimatePresence>
  );
}

