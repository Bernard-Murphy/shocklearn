import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseModule } from '../modules/entities/module.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Quiz } from '../lessons/entities/quiz.entity';
import { QuizAttempt } from '../lessons/entities/quiz-attempt.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonProgress } from '../progress/entities/lesson-progress.entity';
import { ContentVersion } from '../content-versioning/entities/content-version.entity';
import { AIRequest } from '../ai-agents/entities/ai-request.entity';
import { AIResponse } from '../ai-agents/entities/ai-response.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Course,
    CourseModule,
    Lesson,
    Quiz,
    QuizAttempt,
    Enrollment,
    LessonProgress,
    ContentVersion,
    AIRequest,
    AIResponse,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  migrationsTransactionMode: 'each',
});

