import { Field, ID, Int, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LessonTimeMetric {
  @Field(() => ID)
  lessonId: string;

  @Field()
  lessonTitle: string;

  @Field(() => Int)
  averageSeconds: number;
}

@ObjectType()
export class QuizPerformanceMetric {
  @Field(() => ID)
  quizId: string;

  @Field()
  quizTitle: string;

  @Field(() => Int)
  averageScore: number;

  @Field(() => Int)
  passRate: number;

  @Field(() => Int)
  attempts: number;
}

@ObjectType()
export class CourseAnalyticsOutput {
  @Field(() => ID)
  courseId: string;

  @Field(() => Int)
  enrollmentCount: number;

  @Field(() => Int)
  activeStudents: number;

  @Field(() => Int)
  completionRate: number;

  @Field(() => Int)
  averageProgress: number;

  @Field(() => Int)
  totalTimeSpent: number;

  @Field(() => [LessonTimeMetric])
  averageTimePerLesson: LessonTimeMetric[];

  @Field(() => [QuizPerformanceMetric])
  quizPerformance: QuizPerformanceMetric[];
}

@ObjectType()
export class LessonProgressItem {
  @Field(() => ID)
  lessonId: string;

  @Field()
  lessonTitle: string;

  @Field()
  status: string;

  @Field(() => Int)
  timeSpentSeconds: number;

  @Field({ nullable: true })
  completedAt?: Date;
}

@ObjectType()
export class QuizAttemptItem {
  @Field(() => ID)
  quizId: string;

  @Field()
  quizTitle: string;

  @Field(() => Int)
  score: number;

  @Field()
  passed: boolean;

  @Field()
  attemptedAt: Date;
}

@ObjectType()
export class EnrollmentProgressOutput {
  @Field(() => ID)
  enrollmentId: string;

  @Field(() => ID)
  courseId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  status: string;

  @Field(() => Int)
  progressPercentage: number;

  @Field(() => Int)
  completedLessons: number;

  @Field(() => Int)
  totalLessons: number;

  @Field(() => [LessonProgressItem])
  lessonsProgress: LessonProgressItem[];

  @Field(() => [QuizAttemptItem])
  quizAttempts: QuizAttemptItem[];
}

