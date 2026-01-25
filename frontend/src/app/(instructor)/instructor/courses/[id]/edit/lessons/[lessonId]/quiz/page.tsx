'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function LessonQuizPage({ params }: { params: Promise<{ id: string, lessonId: string }> }) {
  const resolvedParams = use(params);
  const { id: courseId, lessonId } = resolvedParams;
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, [lessonId]);

  async function loadQuizzes() {
    try {
      setLoading(true);
      const data = await apiClient.getQuizzesByLesson(lessonId);
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuiz(quizId: string) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await apiClient.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete quiz');
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/instructor/courses/${courseId}/edit/lessons/${lessonId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Lesson Quizzes</h1>
            <p className="text-muted-foreground">Manage assessments for this lesson</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/instructor/courses/${courseId}/ai-tools`}>
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </Link>
          <Button onClick={() => {/* Create manual quiz placeholder */ alert('Create manual quiz coming soon. Use AI Tools for now.')}}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {quizzes.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/50">
            <CardContent className="py-12 text-center space-y-4">
              <div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mx-auto border shadow-sm">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No quizzes yet</h3>
                <p className="text-sm text-muted-foreground">Assess student knowledge by adding a quiz</p>
              </div>
              <Link href={`/instructor/courses/${courseId}/ai-tools`}>
                <Button variant="outline">Use AI to Generate Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.questions?.length || 0} Questions • Passing score: {quiz.passingScore}%</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {/* Edit quiz placeholder */}}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

