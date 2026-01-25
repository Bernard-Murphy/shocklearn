'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

export default function AIToolsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [curriculumData, setCurriculumData] = useState({
    objectives: '',
    targetAudience: '',
    durationHours: '',
  });
  const [quizData, setQuizData] = useState({
    lessonContent: '',
    learningObjectives: '',
    difficultyLevel: 'intermediate',
    numberOfQuestions: '5',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Tools
        </h1>
        <p className="text-muted-foreground mt-2">Generate curriculum and quizzes with AI assistance</p>
      </div>

      <Tabs defaultValue="curriculum" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="curriculum">Curriculum Generator</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Generating...' : 'Generate Curriculum'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="quiz">
          <form onSubmit={handleGenerateQuiz}>
            <Card>
              <CardHeader>
                <CardTitle>Generate Quiz</CardTitle>
                <CardDescription>AI will create quiz questions based on lesson content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
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
                  <Button onClick={() => alert('Apply functionality would be implemented here')}>Apply to Course</Button>
                  <Button variant="outline" onClick={() => setResult(null)}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

