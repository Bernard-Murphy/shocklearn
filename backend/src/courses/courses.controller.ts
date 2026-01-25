import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole, CreateCourseDto, UpdateCourseDto, CourseStatus } from '@edtech/shared';
import { User } from '../users/entities/user.entity';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  create(@CurrentUser() user: User, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(user.id, createCourseDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: CourseStatus,
    @Query('instructorId') instructorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.coursesService.findAll({
      status,
      instructorId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return {
      data: result.data,
      total: result.total,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      hasMore: result.data.length === (limit ? parseInt(limit, 10) : 10),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, user.id, updateCourseDto);
  }

  @Post(':id/publish')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  publish(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coursesService.publish(id, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.coursesService.remove(id, user.id);
    return { message: 'Course deleted successfully' };
  }
}

