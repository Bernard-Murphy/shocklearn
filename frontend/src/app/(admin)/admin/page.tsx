'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade_out, normalize, transition_fast, fade_out_scale_1 } from '@/lib/transitions';

export default function AdminDashboardPage() {
  const [userStats, setUserStats] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [usersData, coursesData] = await Promise.all([apiClient.getUserStats(), apiClient.getCourseStats()]);
      setUserStats(usersData);
      setCourseStats(coursesData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="admin-dashboard-loading"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="p-8 space-y-6"
        >
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="admin-dashboard-content"
          initial={fade_out}
          animate={normalize}
          exit={fade_out_scale_1}
          transition={transition_fast}
          className="p-8 space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Platform overview and statistics</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats?.activeUsersLast30Days || 0} active in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseStats?.totalCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {courseStats?.coursesByStatus?.published || 0} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseStats?.totalEnrollments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg {courseStats?.averageEnrollmentsPerCourse || 0} per course
                </p>
              </CardContent>
            </Card>
          </div>

          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>Distribution of user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Admins</span>
                    <span className="font-medium">{userStats.usersByRole.admin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Users</span>
                    <span className="font-medium">{userStats.usersByRole.user}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {courseStats?.mostPopularCourses && courseStats.mostPopularCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Courses</CardTitle>
                <CardDescription>Top courses by enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseStats.mostPopularCourses.map((course: any, idx: number) => (
                    <div key={course.courseId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
                        <span className="text-sm">{course.title}</span>
                      </div>
                      <span className="text-sm font-medium">{course.enrollmentCount} enrollments</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

