import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonProgress } from '../progress/entities/lesson-progress.entity';
import { QuizAttempt } from '../lessons/entities/quiz-attempt.entity';
import { Quiz } from '../lessons/entities/quiz.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CreateCourseDto, UpdateCourseDto, CourseStatus, CourseAnalyticsDto, EnrollmentStatus, UserStatsDto, CourseStatsDto } from '@edtech/shared';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(QuizAttempt)
    private quizAttemptsRepository: Repository<QuizAttempt>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
  ) {}

  async create(instructorId: string, createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create({
      ...createCourseDto,
      instructorId,
      status: CourseStatus.DRAFT,
    });

    return this.coursesRepository.save(course);
  }

  async findAll(options?: {
    status?: CourseStatus;
    instructorId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Course[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.coursesRepository.createQueryBuilder('course');

    if (options?.status) {
      query.andWhere('course.status = :status', { status: options.status });
    }

    if (options?.instructorId) {
      query.andWhere('course.instructorId = :instructorId', {
        instructorId: options.instructorId,
      });
    }

    query.skip(skip).take(limit).orderBy('course.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, relations?: string[]): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations,
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(
    id: string,
    instructorId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    Object.assign(course, updateCourseDto);
    return this.coursesRepository.save(course);
  }

  async publish(id: string, instructorId: string): Promise<Course> {
    const course = await this.findOne(id);

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    course.status = CourseStatus.PUBLISHED;
    course.publishedAt = new Date();

    return this.coursesRepository.save(course);
  }

  async remove(id: string, instructorId: string): Promise<void> {
    const course = await this.findOne(id);

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.coursesRepository.delete(id);
  }

  async getCourseAnalytics(courseId: string): Promise<CourseAnalyticsDto> {
    const course = await this.findOne(courseId, ['modules', 'modules.lessons']);

    // Get enrollments
    const enrollments = await this.enrollmentsRepository.find({
      where: { courseId },
    });

    const activeStudents = enrollments.filter(
      (e) => e.status === EnrollmentStatus.ACTIVE,
    ).length;

    const completedEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.COMPLETED,
    ).length;

    const completionRate =
      enrollments.length > 0 ? (completedEnrollments / enrollments.length) * 100 : 0;

    const totalProgress = enrollments.reduce(
      (sum, e) => sum + e.progressPercentage,
      0,
    );
    const averageProgress =
      enrollments.length > 0 ? totalProgress / enrollments.length : 0;

    // Get lesson time stats
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const lessonProgress = await this.lessonProgressRepository
      .createQueryBuilder('lp')
      .where('lp.lessonId IN (:...lessonIds)', { lessonIds })
      .getMany();

    const lessonTimeMap = new Map<string, { total: number; count: number }>();
    lessonProgress.forEach((lp) => {
      const current = lessonTimeMap.get(lp.lessonId) || { total: 0, count: 0 };
      lessonTimeMap.set(lp.lessonId, {
        total: current.total + lp.timeSpentSeconds,
        count: current.count + 1,
      });
    });

    const averageTimePerLesson = Array.from(lessonTimeMap.entries()).map(
      ([lessonId, stats]) => {
        const lesson = course.modules
          .flatMap((m) => m.lessons)
          .find((l) => l.id === lessonId);
        return {
          lessonId,
          lessonTitle: lesson?.title || 'Unknown',
          averageSeconds: Math.round(stats.total / stats.count),
        };
      },
    );

    // Get quiz performance
    const quizzes = await this.quizzesRepository
      .createQueryBuilder('quiz')
      .where('quiz.lessonId IN (:...lessonIds)', { lessonIds })
      .getMany();

    const quizPerformance = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await this.quizAttemptsRepository.find({
          where: { quizId: quiz.id },
        });

        const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
        const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0;

        const passedAttempts = attempts.filter((a) => a.score >= quiz.passingScore).length;
        const passRate = attempts.length > 0 ? (passedAttempts / attempts.length) * 100 : 0;

        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          averageScore: Math.round(averageScore),
          passRate: Math.round(passRate),
          attempts: attempts.length,
        };
      }),
    );

    const totalTimeSpent = lessonProgress.reduce(
      (sum, lp) => sum + lp.timeSpentSeconds,
      0,
    );

    return {
      courseId,
      enrollmentCount: enrollments.length,
      activeStudents,
      completionRate: Math.round(completionRate),
      averageProgress: Math.round(averageProgress),
      totalTimeSpent,
      averageTimePerLesson,
      quizPerformance,
    };
  }

  async getCourseStats(): Promise<CourseStatsDto> {
    const totalCourses = await this.coursesRepository.count();

    const [draftCount, publishedCount, archivedCount] = await Promise.all([
      this.coursesRepository.count({ where: { status: CourseStatus.DRAFT } }),
      this.coursesRepository.count({ where: { status: CourseStatus.PUBLISHED } }),
      this.coursesRepository.count({ where: { status: CourseStatus.ARCHIVED } }),
    ]);

    const totalEnrollments = await this.enrollmentsRepository.count();
    const averageEnrollmentsPerCourse =
      totalCourses > 0 ? totalEnrollments / totalCourses : 0;

    const enrollmentCounts = await this.enrollmentsRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.courseId', 'courseId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('enrollment.courseId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const courseIds = enrollmentCounts.map((ec) => ec.courseId);
    const courses = await this.coursesRepository.findByIds(courseIds);

    const mostPopularCourses = enrollmentCounts.map((ec) => {
      const course = courses.find((c) => c.id === ec.courseId);
      return {
        courseId: ec.courseId,
        title: course?.title || 'Unknown',
        enrollmentCount: parseInt(ec.count, 10),
      };
    });

    return {
      totalCourses,
      coursesByStatus: {
        draft: draftCount,
        published: publishedCount,
        archived: archivedCount,
      },
      totalEnrollments,
      averageEnrollmentsPerCourse: Math.round(averageEnrollmentsPerCourse),
      mostPopularCourses,
    };
  }
}

