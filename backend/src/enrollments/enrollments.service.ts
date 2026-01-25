import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentStatus } from '@edtech/shared';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
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
}

