// User Types
export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  LEARNER = 'learner',
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

