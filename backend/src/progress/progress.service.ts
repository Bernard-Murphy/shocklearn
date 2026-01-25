import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonProgress } from './entities/lesson-progress.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LessonProgressStatus } from '@edtech/shared';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private progressRepository: Repository<LessonProgress>,
    private enrollmentsService: EnrollmentsService,
  ) {}

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    status: LessonProgressStatus,
    timeSpentSeconds?: number,
  ): Promise<LessonProgress> {
    let progress = await this.progressRepository.findOne({
      where: { enrollmentId, lessonId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        enrollmentId,
        lessonId,
        status,
        timeSpentSeconds: timeSpentSeconds || 0,
      });
    } else {
      progress.status = status;
      if (timeSpentSeconds !== undefined) {
        progress.timeSpentSeconds += timeSpentSeconds;
      }
    }

    if (status === LessonProgressStatus.IN_PROGRESS && !progress.startedAt) {
      progress.startedAt = new Date();
    }

    if (status === LessonProgressStatus.COMPLETED && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    progress.lastAccessedAt = new Date();

    await this.progressRepository.save(progress);

    // Update enrollment progress percentage
    await this.calculateAndUpdateEnrollmentProgress(enrollmentId);

    return progress;
  }

  async findByEnrollment(enrollmentId: string): Promise<LessonProgress[]> {
    return this.progressRepository.find({
      where: { enrollmentId },
      relations: ['lesson'],
      order: { lastAccessedAt: 'DESC' },
    });
  }

  private async calculateAndUpdateEnrollmentProgress(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentsService.findOne(enrollmentId);
    const allProgress = await this.findByEnrollment(enrollmentId);

    const completedLessons = allProgress.filter(
      (p) => p.status === LessonProgressStatus.COMPLETED,
    ).length;

    // Get total lessons in the course (simplified - would need to count actual lessons)
    const totalLessons = allProgress.length;

    if (totalLessons > 0) {
      const progressPercentage = (completedLessons / totalLessons) * 100;
      await this.enrollmentsService.updateProgress(enrollmentId, progressPercentage);
    }
  }
}

