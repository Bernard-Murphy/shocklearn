'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import BouncyClick from '@/components/ui/bouncy-click';
import { Separator } from '@/components/ui/separator';

export default function LessonEditPage({ params }: { params: { id: string, lessonId: string } }) {
  const { id: courseId, lessonId } = params;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState(15);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  async function loadLesson() {
    try {
      setLoading(true);
      const data = await apiClient.getLesson(lessonId);
      setLesson(data);
      setTitle(data.title);
      setContent(data.content || '');
      setDuration(data.estimatedDurationMinutes || 15);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await apiClient.updateLesson(lessonId, {
        title,
        content,
        estimatedDurationMinutes: duration
      });
      alert('Lesson saved successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BouncyClick>
            <Link href={`/instructor/courses/${courseId}/edit`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </BouncyClick>
          <div>
            <h1 className="text-2xl font-bold">Edit Lesson</h1>
            <p className="text-muted-foreground">{lesson?.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <BouncyClick>
            <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {isPreview ? 'Edit Mode' : 'Preview'}
            </Button>
          </BouncyClick>
          <BouncyClick>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </BouncyClick>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isPreview ? (
            <Card className="min-h-[600px]">
              <CardContent className="pt-6 prose prose-slate max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <BouncyClick>
                    <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => {/* AI tools link */ }}>
                      <Sparkles className="mr-2 h-3 w-3" />
                      AI Assist
                    </Button>
                  </BouncyClick>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Write your lesson content in markdown..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (mins)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Quizzes</Label>
                <div className="space-y-2">
                  <BouncyClick>
                    <Link href={`/instructor/courses/${courseId}/edit/lessons/${lessonId}/quiz`}>
                      <Button variant="outline" className="w-full justify-start">
                        Manage Quizzes
                      </Button>
                    </Link>
                  </BouncyClick>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Help</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc pl-4 space-y-2">
                <li>Use standard Markdown for formatting</li>
                <li>Preview allows you to see how students will view the content</li>
                <li>Changes are not automatically saved</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

