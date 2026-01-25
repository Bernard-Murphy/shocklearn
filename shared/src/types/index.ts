// User Types
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Course Types
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ContentType {
  MARKDOWN = 'markdown',
  VIDEO = 'video',
  INTERACTIVE = 'interactive',
}

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  status: CourseStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  contentType: ContentType;
  orderIndex: number;
  estimatedDurationMinutes: number;
  activeVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment Types
export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export enum LessonProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  progressPercentage: number;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: LessonProgressStatus;
  timeSpentSeconds: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
}

// Quiz Types
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  attemptedAt: Date;
}

// Content Versioning Types
export enum ContentVersionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ContentVersion {
  id: string;
  lessonId: string;
  authorId: string;
  versionNumber: number;
  content: string;
  changeDescription: string;
  status: ContentVersionStatus;
  aiMetadata?: Record<string, unknown>;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// AI Agent Types
export enum AgentType {
  CURRICULUM_GENERATOR = 'curriculum_generator',
  QUIZ_GENERATOR = 'quiz_generator',
  RECOMMENDATION = 'recommendation',
}

export enum AIRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AIRequest {
  id: string;
  userId: string;
  agentType: AgentType;
  inputData: Record<string, unknown>;
  status: AIRequestStatus;
  reasoning?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AIResponse {
  id: string;
  requestId: string;
  outputData: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  confidenceScore?: number;
  explanation: string;
  createdAt: Date;
}

// DTO Types for API
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface CreateCourseDto {
  title: string;
  description: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  status?: CourseStatus;
}

export interface CreateModuleDto {
  title: string;
  description: string;
  orderIndex: number;
}

export interface CreateLessonDto {
  title: string;
  content: string;
  contentType: ContentType;
  orderIndex: number;
  estimatedDurationMinutes: number;
}

export interface GenerateCurriculumDto {
  objectives: string[];
  targetAudience: string;
  durationHours: number;
  prerequisites?: string[];
}

export interface GenerateQuizDto {
  lessonContent: string;
  learningObjectives: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  numberOfQuestions: number;
}

export interface CurriculumOutput {
  modules: {
    title: string;
    description: string;
    lessons: {
      title: string;
      learningObjectives: string[];
      content: string;
      estimatedDuration: number;
    }[];
  }[];
  reasoning: string;
}

export interface QuizOutput {
  questions: QuizQuestion[];
  reasoning: string;
}

export interface RecommendationOutput {
  recommendations: {
    type: 'next_lesson' | 'review' | 'additional_resource';
    title: string;
    description: string;
    lessonId?: string;
    priority: number;
  }[];
  reasoning: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

// Quiz DTOs
export interface CreateQuizDto {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface UpdateQuizDto {
  title?: string;
  questions?: QuizQuestion[];
  passingScore?: number;
}

export interface SubmitQuizDto {
  answers: Record<string, string>;
}

export interface QuizResultDto {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  answers: Record<string, string>;
  correctAnswersMap: Record<string, string | string[]>;
  attemptId: string;
}

// Analytics DTOs
export interface CourseAnalyticsDto {
  courseId: string;
  enrollmentCount: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalTimeSpent: number;
  averageTimePerLesson: {
    lessonId: string;
    lessonTitle: string;
    averageSeconds: number;
  }[];
  quizPerformance: {
    quizId: string;
    quizTitle: string;
    averageScore: number;
    passRate: number;
    attempts: number;
  }[];
}

export interface EnrollmentProgressDto {
  enrollmentId: string;
  courseId: string;
  userId: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lessonsProgress: {
    lessonId: string;
    lessonTitle: string;
    status: LessonProgressStatus;
    timeSpentSeconds: number;
    completedAt?: Date;
  }[];
  quizAttempts: {
    quizId: string;
    quizTitle: string;
    score: number;
    passed: boolean;
    attemptedAt: Date;
  }[];
}

// Admin DTOs
export interface UserStatsDto {
  totalUsers: number;
  usersByRole: {
    admin: number;
    user: number;
  };
  recentUsers: User[];
  activeUsersLast30Days: number;
}

export interface CourseStatsDto {
  totalCourses: number;
  coursesByStatus: {
    draft: number;
    published: number;
    archived: number;
  };
  totalEnrollments: number;
  averageEnrollmentsPerCourse: number;
  mostPopularCourses: {
    courseId: string;
    title: string;
    enrollmentCount: number;
  }[];
}

// Module and Lesson with relations DTOs
export interface ModuleWithLessonsDto extends CourseModule {
  lessons: Lesson[];
}

export interface CourseWithModulesDto extends Course {
  modules: ModuleWithLessonsDto[];
  instructor?: User;
  enrollmentCount?: number;
}

// Content Version DTOs
export interface PendingVersionDto extends ContentVersion {
  lesson: Lesson;
  author: User;
}

