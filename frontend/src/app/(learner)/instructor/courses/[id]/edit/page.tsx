'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Plus,
  Save,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Edit2,
  FileText,
  Layout,
  ArrowLeft
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import BouncyClick from '@/components/ui/bouncy-click';
import Spinner from '@/components/ui/spinner';
import { AddModuleDialog } from '@/components/instructor/add-module-dialog';
import { AddLessonDialog } from '@/components/instructor/add-lesson-dialog';

interface Lesson {
  id: string;
  title: string;
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
  status: string;
  modules: Module[];
}

export default function CourseEditPage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  async function loadCourseData() {
    try {
      setLoading(true);
      const courseData = await apiClient.getCourse(courseId);
      // Fetch modules and lessons
      const modulesData = await apiClient.getModulesByCourse(courseId);

      // For each module, fetch its lessons
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod: any) => {
          const lessons = await apiClient.getLessonsByModule(mod.id);
          return { ...mod, lessons };
        })
      );

      const fullCourse = { ...courseData, modules: modulesWithLessons };
      setCourse(fullCourse);
      setTitle(fullCourse.title);
      setDescription(fullCourse.description);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCourse(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.updateCourse(courseId, { title, description });
      setCourse(prev => prev ? { ...prev, title, description } : null);
      alert('Course updated successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddModule() {
    setIsAddModuleOpen(true);
  }

  function handleModuleCreated(newModule: any) {
    setCourse(prev => prev ? {
      ...prev,
      modules: [...prev.modules, { ...newModule, lessons: [] }]
    } : null);
  }

  async function handleDeleteModule(moduleId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;

    try {
      await apiClient.deleteModule(moduleId);
      setCourse(prev => prev ? {
        ...prev,
        modules: prev.modules.filter(m => m.id !== moduleId)
      } : null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete module');
    }
  }

  async function handleAddLesson(moduleId: string) {
    setActiveModuleId(moduleId);
    setIsAddLessonOpen(true);
  }

  function handleLessonCreated(newLesson: any) {
    if (!activeModuleId) return;

    setCourse(prev => {
      if (!prev) return null;
      return {
        ...prev,
        modules: prev.modules.map(m =>
          m.id === activeModuleId
            ? { ...m, lessons: [...m.lessons, newLesson] }
            : m
        )
      };
    });
  }

  async function handleDeleteLesson(moduleId: string, lessonId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await apiClient.deleteLesson(lessonId);
      setCourse(prev => {
        if (!prev) return null;
        return {
          ...prev,
          modules: prev.modules.map(m =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
              : m
          )
        };
      });
    } catch (error: any) {
      alert(error.message || 'Failed to delete lesson');
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BouncyClick>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </BouncyClick>
          <div>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground">Modify course content and structure</p>
          </div>
        </div>
        <div className="flex gap-2">
          <BouncyClick>
            <Link href={`/instructor/courses/${courseId}/ai-tools`}>
              <Button variant="outline">AI Tools</Button>
            </Link>
          </BouncyClick>
          <BouncyClick>
            <Button disabled={course.status === 'published'} variant="default" onClick={() => apiClient.publishCourse(courseId).then(() => loadCourseData())}>
              {course.status === 'published' ? 'Published' : 'Publish'}
            </Button>
          </BouncyClick>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Course Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Basic information about your course</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Course Title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your course..."
                    rows={5}
                  />
                </div>
                <BouncyClick disabled={saving} className="w-full">
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? <>
                      <Spinner size="sm" color="white" className="mr-2" />
                      Saving
                    </> : <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>}
                  </Button>
                </BouncyClick>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                  {course.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Curriculum Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Curriculum
            </h2>
            <BouncyClick>
              <Button size="sm" onClick={handleAddModule}>
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </BouncyClick>
          </div>

          {course.modules.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/50">
              <CardContent className="py-12 text-center space-y-4">
                <div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mx-auto border shadow-sm">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">No modules yet</h3>
                  <p className="text-sm text-muted-foreground">Start by adding your first module</p>
                </div>
                <BouncyClick>
                  <Button variant="outline" onClick={handleAddModule}>Add Module</Button>
                </BouncyClick>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {course.modules
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg bg-card px-4">
                    <div className="flex items-center">
                      <AccordionTrigger className="hover:no-underline py-4 flex-1">
                        <div className="flex items-center gap-3 text-left">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Module {module.orderIndex}:</span>
                            <h3 className="font-semibold">{module.title}</h3>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center gap-2 ml-4">
                        <BouncyClick>
                          <Button variant="ghost" size="icon" onClick={() => {/* Edit module title */ }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </BouncyClick>
                        <BouncyClick>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => handleDeleteModule(module.id, e)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </BouncyClick>
                      </div>
                    </div>
                    <AccordionContent className="pb-4 space-y-3">
                      <div className="pl-7 space-y-3">
                        {module.lessons
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-md bg-muted/50 border group hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <BouncyClick>
                                  <Link href={`/instructor/courses/${courseId}/edit/lessons/${lesson.id}`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                </BouncyClick>
                                <BouncyClick>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={(e) => handleDeleteLesson(module.id, lesson.id, e)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </BouncyClick>
                              </div>
                            </div>
                          ))}
                        <BouncyClick>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full border-dashed border justify-start h-10 text-muted-foreground"
                            onClick={() => handleAddLesson(module.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Lesson
                          </Button>
                        </BouncyClick>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </div>
      </div>

      <AddModuleDialog
        courseId={courseId}
        orderIndex={(course?.modules.length || 0) + 1}
        open={isAddModuleOpen}
        onOpenChange={setIsAddModuleOpen}
        onSuccess={handleModuleCreated}
      />

      <AddLessonDialog
        moduleId={activeModuleId || ''}
        orderIndex={(course?.modules.find(m => m.id === activeModuleId)?.lessons.length || 0) + 1}
        open={isAddLessonOpen}
        onOpenChange={setIsAddLessonOpen}
        onSuccess={handleLessonCreated}
      />
    </div>
  );
}

