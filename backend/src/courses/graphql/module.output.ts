import { ObjectType, Field } from '@nestjs/graphql';
import { LessonOutput } from './lesson.output';

@ObjectType()
export class ModuleOutput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => [LessonOutput])
  lessons: LessonOutput[];
}

