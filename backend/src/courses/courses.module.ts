import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesResolver } from './courses.resolver';
import { Course } from './entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonProgress } from '../progress/entities/lesson-progress.entity';
import { QuizAttempt } from '../lessons/entities/quiz-attempt.entity';
import { Quiz } from '../lessons/entities/quiz.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Enrollment,
      LessonProgress,
      QuizAttempt,
      Quiz,
      Lesson,
    ]),
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}

