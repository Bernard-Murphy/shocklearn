import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseModule } from './entities/module.entity';
import { CoursesService } from '../courses/courses.service';
import { CreateModuleDto } from '@edtech/shared';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(CourseModule)
    private modulesRepository: Repository<CourseModule>,
    private coursesService: CoursesService,
  ) {}

  async create(
    courseId: string,
    userId: string,
    createModuleDto: CreateModuleDto,
  ): Promise<CourseModule> {
    const course = await this.coursesService.findOne(courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only add modules to your own courses');
    }

    const module = this.modulesRepository.create({
      ...createModuleDto,
      courseId,
    });

    return this.modulesRepository.save(module);
  }

  async findByCourse(courseId: string): Promise<CourseModule[]> {
    return this.modulesRepository.find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CourseModule> {
    const module = await this.modulesRepository.findOne({
      where: { id },
      relations: ['lessons'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async update(
    id: string,
    userId: string,
    updateData: Partial<CourseModule>,
  ): Promise<CourseModule> {
    const module = await this.findOne(id);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only update modules in your own courses');
    }

    Object.assign(module, updateData);
    return this.modulesRepository.save(module);
  }

  async remove(id: string, userId: string): Promise<void> {
    const module = await this.findOne(id);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only delete modules from your own courses');
    }

    await this.modulesRepository.delete(id);
  }
}

