import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, CourseStatus } from '@edtech/shared';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
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
}

