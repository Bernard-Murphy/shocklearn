import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { LessonProgress } from '../progress/entities/lesson-progress.entity';
import { QuizAttempt } from '../lessons/entities/quiz-attempt.entity';
import { Quiz } from '../lessons/entities/quiz.entity';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentStatus, EnrollmentProgressDto, LessonProgressStatus } from '@edtech/shared';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(QuizAttempt)
    private quizAttemptsRepository: Repository<QuizAttempt>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    private coursesService: CoursesService,
  ) {}

  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    // Verify course exists
    await this.coursesService.findOne(courseId);

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentsRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentsRepository.create({
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
      progressPercentage: 0,
    });

    return this.enrollmentsRepository.save(enrollment);
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['course', 'user', 'lessonProgress'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async updateProgress(enrollmentId: string, progressPercentage: number): Promise<Enrollment> {
    const enrollment = await this.findOne(enrollmentId);
    enrollment.progressPercentage = progressPercentage;

    if (progressPercentage >= 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    return this.enrollmentsRepository.save(enrollment);
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<EnrollmentProgressDto> {
    const enrollment = await this.findOne(enrollmentId);
    const course = await this.coursesService.findOne(enrollment.courseId, [
      'modules',
      'modules.lessons',
      'modules.lessons.quizzes',
    ]);

    const allLessons = course.modules.flatMap((m) => m.lessons);
    const lessonIds = allLessons.map((l) => l.id);

    // Get lesson progress
    const lessonProgress = await this.lessonProgressRepository.find({
      where: { enrollmentId },
    });

    const progressMap = new Map(lessonProgress.map((lp) => [lp.lessonId, lp]));

    const lessonsProgress = allLessons.map((lesson) => {
      const progress = progressMap.get(lesson.id);
      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        status: (progress?.status || LessonProgressStatus.NOT_STARTED) as LessonProgressStatus,
        timeSpentSeconds: progress?.timeSpentSeconds || 0,
        completedAt: progress?.completedAt,
      };
    });

    const completedLessons = lessonProgress.filter(
      (lp) => lp.status === 'completed',
    ).length;

    // Get quiz attempts
    const quizIds = course.modules
      .flatMap((m) => m.lessons)
      .flatMap((l) => l.quizzes || [])
      .map((q) => q.id);

    const quizAttempts = await this.quizAttemptsRepository.find({
      where: { userId: enrollment.userId },
    });

    const quizAttemptsFiltered = quizAttempts.filter((qa) =>
      quizIds.includes(qa.quizId),
    );

    const quizzes = await this.quizzesRepository.findByIds(quizIds);
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));

    const quizAttemptsData = quizAttemptsFiltered.map((attempt) => {
      const quiz = quizMap.get(attempt.quizId);
      return {
        quizId: attempt.quizId,
        quizTitle: quiz?.title || 'Unknown',
        score: attempt.score,
        passed: quiz ? attempt.score >= quiz.passingScore : false,
        attemptedAt: attempt.attemptedAt,
      };
    });

    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      status: enrollment.status,
      progressPercentage: enrollment.progressPercentage,
      completedLessons,
      totalLessons: allLessons.length,
      lessonsProgress,
      quizAttempts: quizAttemptsData,
    };
  }
}

