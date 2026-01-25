'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';
import BouncyClick from '@/components/ui/bouncy-click';
import Link from 'next/link';

export default function AIToolsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [lessons, setLessons] = useState<any[]>([]);
  const [curriculumData, setCurriculumData] = useState({
    objectives: '',
    targetAudience: '',
    durationHours: '',
  });
  const [quizData, setQuizData] = useState({
    lessonId: '',
    lessonContent: '',
    learningObjectives: '',
    difficultyLevel: 'intermediate',
    numberOfQuestions: '5',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [tab, setTab] = useState<'curriculum' | 'quiz'>('curriculum');

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  async function loadLessons() {
    try {
      const modules = await apiClient.getModulesByCourse(courseId);
      const allLessons = [];
      for (const mod of modules) {
        const modLessons = await apiClient.getLessonsByModule(mod.id);
        allLessons.push(...modLessons.map((l: any) => ({ ...l, moduleTitle: mod.title })));
      }
      setLessons(allLessons);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    }
  }

  async function handleGenerateCurriculum(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.generateCurriculum({
        objectives: curriculumData.objectives.split('\n').filter((o) => o.trim()),
        targetAudience: curriculumData.targetAudience,
        durationHours: parseInt(curriculumData.durationHours),
      });

      setResult({
        type: 'curriculum',
        data: response.curriculum,
        reasoning: response.reasoning,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to generate curriculum');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQuiz(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.generateQuiz({
        lessonContent: quizData.lessonContent,
        learningObjectives: quizData.learningObjectives.split('\n').filter((o) => o.trim()),
        difficultyLevel: quizData.difficultyLevel,
        numberOfQuestions: parseInt(quizData.numberOfQuestions),
      });

      setResult({
        type: 'quiz',
        data: response.quiz,
        reasoning: response.reasoning,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!result) return;
    setApplying(true);

    try {
      if (result.type === 'curriculum') {
        await apiClient.applyCurriculum({
          courseId,
          curriculum: result.data,
        });
        alert('Curriculum applied successfully!');
        router.push(`/instructor/courses/${courseId}/edit`);
      } else if (result.type === 'quiz') {
        if (!quizData.lessonId) {
          alert('Please select a lesson to apply the quiz to');
          setApplying(false);
          return;
        }
        await apiClient.applyQuiz({
          lessonId: quizData.lessonId,
          quiz: result.data,
        });
        alert('Quiz applied successfully!');
        setResult(null);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Tools
            </h1>
            <p className="text-muted-foreground mt-2">Generate curriculum and quizzes with AI assistance</p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as 'curriculum' | 'quiz')} className="space-y-6">
        <TabsList>
          <BouncyClick>
            <TabsTrigger className="px-16 text-center" value="curriculum">Curriculum Generator</TabsTrigger>
          </BouncyClick>
          <BouncyClick>
            <TabsTrigger className="px-16 text-center" value="quiz">Quiz Generator</TabsTrigger>
          </BouncyClick>
        </TabsList>

        <AnimatePresence mode="wait">
          {tab === 'curriculum' && (
            <motion.div
              key="curriculum"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
            >
              <form onSubmit={handleGenerateCurriculum}>
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Course Curriculum</CardTitle>
                    <CardDescription>AI will create a structured curriculum based on your objectives</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="objectives">Learning Objectives (one per line) *</Label>
                      <Textarea
                        id="objectives"
                        value={curriculumData.objectives}
                        onChange={(e) => setCurriculumData({ ...curriculumData, objectives: e.target.value })}
                        placeholder="Understand HTML structure&#10;Learn CSS styling&#10;Build responsive layouts"
                        rows={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience *</Label>
                      <Input
                        id="targetAudience"
                        value={curriculumData.targetAudience}
                        onChange={(e) => setCurriculumData({ ...curriculumData, targetAudience: e.target.value })}
                        placeholder="Beginners with no programming experience"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="durationHours">Duration (hours) *</Label>
                      <Input
                        id="durationHours"
                        type="number"
                        value={curriculumData.durationHours}
                        onChange={(e) => setCurriculumData({ ...curriculumData, durationHours: e.target.value })}
                        placeholder="10"
                        required
                      />
                    </div>

                    <BouncyClick className="w-full">
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Generating...' : 'Generate Curriculum'}
                      </Button>
                    </BouncyClick>
                  </CardContent>
                </Card>
              </form>
            </motion.div>
          )}
          {tab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
            >
              <form onSubmit={handleGenerateQuiz}>
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Quiz</CardTitle>
                    <CardDescription>AI will create quiz questions based on lesson content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lessonId">Select Lesson *</Label>
                      <select
                        id="lessonId"
                        value={quizData.lessonId}
                        onChange={(e) => setQuizData({ ...quizData, lessonId: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        required
                      >
                        <option value="">Select a lesson...</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            [{lesson.moduleTitle}] {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lessonContent">Lesson Content *</Label>
                      <Textarea
                        id="lessonContent"
                        value={quizData.lessonContent}
                        onChange={(e) => setQuizData({ ...quizData, lessonContent: e.target.value })}
                        placeholder="Paste the lesson content here..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="learningObjectives">Learning Objectives (one per line) *</Label>
                      <Textarea
                        id="learningObjectives"
                        value={quizData.learningObjectives}
                        onChange={(e) => setQuizData({ ...quizData, learningObjectives: e.target.value })}
                        placeholder="Understand the concept&#10;Apply the technique"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numberOfQuestions">Number of Questions *</Label>
                        <Input
                          id="numberOfQuestions"
                          type="number"
                          min="1"
                          max="20"
                          value={quizData.numberOfQuestions}
                          onChange={(e) => setQuizData({ ...quizData, numberOfQuestions: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                        <select
                          id="difficultyLevel"
                          value={quizData.difficultyLevel}
                          onChange={(e) => setQuizData({ ...quizData, difficultyLevel: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <BouncyClick className="w-full">
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Generating...' : 'Generate Quiz'}
                      </Button>
                    </BouncyClick>
                  </CardContent>
                </Card>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={fade_out}
            animate={normalize}
            exit={fade_out_scale_1}
            transition={transition_fast}
          >
            <Card>
              <CardHeader>
                <CardTitle>Generated {result.type === 'curriculum' ? 'Curriculum' : 'Quiz'}</CardTitle>
                <CardDescription>Review and apply to your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(result.data, null, 2)}</pre>
                </div>

                {result.reasoning && (
                  <div className="space-y-2">
                    <Label>AI Reasoning</Label>
                    <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <BouncyClick>
                    <Button onClick={handleApply} disabled={applying}>
                      {applying ? 'Applying...' : 'Apply to Course'}
                    </Button>
                  </BouncyClick>
                  <BouncyClick>
                    <Button variant="outline" onClick={() => setResult(null)} disabled={applying}>
                      Clear
                    </Button>
                  </BouncyClick>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

