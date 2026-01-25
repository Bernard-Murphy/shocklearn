'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, moduleId, lessonId } = params as { courseId: string; moduleId: string; lessonId: string };

  const [lesson, setLesson] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadData();
  }, [lessonId]);

  async function loadData() {
    try {
      const [lessonData, quizzesData, enrollmentsData] = await Promise.all([
        apiClient.getLesson(lessonId),
        apiClient.getQuizzesByLesson(lessonId),
        apiClient.getMyEnrollments(),
      ]);

      setLesson(lessonData);
      setQuizzes(quizzesData || []);

      const enrollmentForCourse = enrollmentsData.find((e: any) => e.courseId === courseId);
      setEnrollment(enrollmentForCourse);

      // Mark as in progress
      if (enrollmentForCourse) {
        await apiClient.updateLessonProgress(lessonId, enrollmentForCourse.id, 'in_progress');
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!enrollment) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      await apiClient.updateLessonProgress(lessonId, enrollment.id, 'completed', timeSpent);
      alert('Lesson marked as complete!');
      router.push(`/courses/${courseId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to mark lesson as complete');
    }
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
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-96 w-full" />
        </motion.div> :
        <AnimatePresence mode="wait">
          {!lesson ?
            <motion.div
              key="no-lesson"
              className="p-8"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
            >
              Lesson not found
            </motion.div> : <motion.div
              key="lesson"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
            >
              <div className="flex items-center justify-between">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </Link>
              </div>

              <div>
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
                <p className="text-muted-foreground mt-2">
                  Estimated time: {lesson.estimatedDurationMinutes} minutes
                </p>
              </div>

              <Card>
                <CardContent className="pt-6 prose prose-slate max-w-none">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </CardContent>
              </Card>

              <AnimatePresence mode="wait">
                {quizzes.length > 0 && (
                  <motion.div
                    key={String(quizzes.length > 0)}
                    initial={fade_out}
                    animate={normalize}
                    exit={fade_out_scale_1}
                    transition={transition_fast}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Quizzes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {quizzes.map((quiz: any) => (
                          <Link key={quiz.id} href={`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz/${quiz.id}`}>
                            <Button variant="outline" className="w-full justify-start">
                              {quiz.title}
                              <ArrowRight className="ml-auto h-4 w-4" />
                            </Button>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <Button onClick={handleComplete} size="lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Mark as Complete
                </Button>
              </div>
            </motion.div>}
        </AnimatePresence>}
    </AnimatePresence>
  );
}

