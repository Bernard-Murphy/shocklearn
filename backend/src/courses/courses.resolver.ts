import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseDetailOutput } from './graphql/course-detail.output';

@Resolver('Course')
@UseGuards(JwtAuthGuard)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Query(() => CourseDetailOutput)
  async courseWithFullStructure(@Args('id', { type: () => ID }) id: string) {
    return this.coursesService.findOne(id, ['modules', 'modules.lessons', 'enrollments']);
  }
}

