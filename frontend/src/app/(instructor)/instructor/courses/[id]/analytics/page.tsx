'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, CheckCircle, Clock, TrendingUp, BarChart2, PieChart } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function CourseAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await apiClient.getCourseAnalytics(courseId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!analytics) return <div>No analytics found for this course</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/instructor/courses`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Course Analytics</h1>
          <p className="text-muted-foreground">Detailed performance metrics for your course</p>
        </div>
      </div>

      {/* High-level stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.enrollmentCount}</div>
            <p className="text-xs text-muted-foreground">+{analytics.activeStudents} active now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <Progress value={analytics.completionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageProgress}%</div>
            <Progress value={analytics.averageProgress} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.totalTimeSpent / 3600)}h</div>
            <p className="text-xs text-muted-foreground">Total platform hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lesson performance */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Time Spent per Lesson
            </CardTitle>
            <CardDescription>Average minutes students spend on each lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.averageTimePerLesson.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No lesson data available yet</p>
              ) : (
                analytics.averageTimePerLesson.map((item: any) => (
                  <div key={item.lessonId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[70%]">{item.lessonTitle}</span>
                      <span className="text-muted-foreground">{Math.round(item.averageSeconds / 60)} min</span>
                    </div>
                    <Progress value={Math.min((item.averageSeconds / 1800) * 100, 100)} className="h-1.5" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz performance */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Quiz Performance
            </CardTitle>
            <CardDescription>Pass rates and average scores for assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics.quizPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No quiz data available yet</p>
              ) : (
                analytics.quizPerformance.map((item: any) => (
                  <div key={item.quizId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate max-w-[60%]">{item.quizTitle}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600 font-semibold">{item.passRate}% Pass</span>
                        <span className="text-blue-600 font-semibold">{item.averageScore}% Avg</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-1.5">
                      <Progress value={item.passRate} className="bg-muted [&>div]:bg-green-500" />
                      <Progress value={item.averageScore} className="bg-muted [&>div]:bg-blue-500" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.attempts} attempts total</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment list placeholder or table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Last few students to join the course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground italic">
            Detailed student list coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

