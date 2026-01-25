import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseDetailOutput } from './graphql/course-detail.output';
import { CourseAnalyticsOutput, EnrollmentProgressOutput } from './graphql/course-analytics.output';

@Resolver('Course')
@UseGuards(JwtAuthGuard)
export class CoursesResolver {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Query(() => CourseDetailOutput)
  async courseWithFullStructure(@Args('id', { type: () => ID }) id: string) {
    return this.coursesService.findOne(id, ['modules', 'modules.lessons', 'enrollments']);
  }

  @Query(() => CourseAnalyticsOutput)
  async instructorAnalytics(@Args('courseId', { type: () => ID }) courseId: string) {
    return this.coursesService.getCourseAnalytics(courseId);
  }

  @Query(() => EnrollmentProgressOutput)
  async enrollmentProgress(@Args('enrollmentId', { type: () => ID }) enrollmentId: string) {
    return this.enrollmentsService.getEnrollmentProgress(enrollmentId);
  }
}

