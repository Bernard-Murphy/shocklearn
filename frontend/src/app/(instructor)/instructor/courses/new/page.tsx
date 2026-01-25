'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const course = await apiClient.createCourse({ title, description });
      router.push(`/instructor/courses/${course.id}/edit`);
    } catch (error: any) {
      setLoading(false);
      alert(error.message || 'Failed to create course');
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <Link href="/instructor/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-2">Start by providing basic course information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Introduction to Web Development"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={5}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

