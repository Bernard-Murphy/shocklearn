'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, moduleId, lessonId, quizId } = params as any;

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  async function loadQuiz() {
    try {
      const quizData = await apiClient.getQuiz(quizId);
      setQuiz(quizData);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const resultData = await apiClient.submitQuiz(quizId, answers);
      setResult(resultData);
    } catch (error: any) {
      alert(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {loading ?
        <motion.div
          key="loading"
          className="p-8 space-y-6 max-w-4xl mx-auto"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
        >
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-96 w-full" />
        </motion.div> :
        <AnimatePresence mode="wait">
          {!quiz ?
            <motion.div
              key="no-quiz"
              initial={fade_out}
              animate={normalize}
              exit={fade_out_scale_1}
              transition={transition_fast}
              className="p-8"
            >
              Quiz not found</motion.div> :
            <AnimatePresence mode="wait">
              {result ?
                <motion.div
                  key="result"
                  initial={fade_out}
                  animate={normalize}
                  exit={fade_out_scale_1}
                  transition={transition_fast}
                  className="p-8 space-y-6 max-w-4xl mx-auto"
                >
                  <Link href={`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Lesson
                    </Button>
                  </Link>

                  <Card className={result.passed ? 'border-green-500' : 'border-red-500'}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {result.passed ? (
                          <CheckCircle className="h-12 w-12 text-green-500" />
                        ) : (
                          <XCircle className="h-12 w-12 text-red-500" />
                        )}
                        <div>
                          <CardTitle>{result.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}</CardTitle>
                          <CardDescription>
                            You scored {result.score}% ({result.correctAnswers}/{result.totalQuestions} correct)
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">
                        {result.passed
                          ? 'Congratulations! You have passed this quiz.'
                          : `You need ${quiz.passingScore}% to pass. Try again!`}
                      </p>

                      <div className="space-y-4 pt-4">
                        <h3 className="font-semibold">Review Your Answers</h3>
                        {quiz.questions.map((q: any, idx: number) => {
                          const userAnswer = result.answers[q.id];
                          const correctAnswer = result.correctAnswersMap[q.id];
                          const isCorrect = Array.isArray(correctAnswer)
                            ? correctAnswer.includes(userAnswer)
                            : userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

                          return (
                            <Card key={q.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                  {isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                                  Question {idx + 1}: {q.question}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div>
                                  <span className="font-medium">Your answer:</span> {userAnswer || '(No answer)'}
                                </div>
                                {!isCorrect && (
                                  <div>
                                    <span className="font-medium">Correct answer:</span>{' '}
                                    {Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer}
                                  </div>
                                )}
                                {q.explanation && (
                                  <div className="text-sm text-muted-foreground pt-2">
                                    <span className="font-medium">Explanation:</span> {q.explanation}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      <div className="flex gap-4">
                        <Button onClick={() => setResult(null)} variant="outline">
                          Retake Quiz
                        </Button>
                        <Link href={`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                          <Button>Back to Lesson</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div> :
                <motion.div
                  key="quiz"
                  initial={fade_out}
                  animate={normalize}
                  exit={fade_out_scale_1}
                  transition={transition_fast}
                >
                  <div className="p-8 space-y-6 max-w-4xl mx-auto">
                    <Link href={`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Lesson
                      </Button>
                    </Link>

                    <Card>
                      <CardHeader>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz.questions.length} questions • Passing score: {quiz.passingScore}%
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {quiz.questions.map((question: any, idx: number) => (
                          <Card key={question.id}>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Question {idx + 1}: {question.question}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {question.type === 'multiple_choice' ? (
                                <RadioGroup
                                  value={answers[question.id] || ''}
                                  onValueChange={(value: string) => setAnswers({ ...answers, [question.id]: value })}
                                >
                                  {question.options?.map((option: string, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`${question.id}-${optIdx}`} />
                                      <Label htmlFor={`${question.id}-${optIdx}`}>{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              ) : (
                                <Input
                                  placeholder="Type your answer..."
                                  value={answers[question.id] || ''}
                                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                                />
                              )}
                            </CardContent>
                          </Card>
                        ))}

                        <Button
                          onClick={handleSubmit}
                          disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                          size="lg"
                          className="w-full"
                        >
                          {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              }
            </AnimatePresence>}
        </AnimatePresence>}
    </AnimatePresence>
  );
}

