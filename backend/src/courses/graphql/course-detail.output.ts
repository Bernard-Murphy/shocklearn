import { ObjectType, Field } from '@nestjs/graphql';
import { ModuleOutput } from './module.output';

@ObjectType()
export class CourseDetailOutput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [ModuleOutput])
  modules: ModuleOutput[];
}

