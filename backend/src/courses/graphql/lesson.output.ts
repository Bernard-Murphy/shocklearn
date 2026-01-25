import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class LessonOutput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => Int)
  orderIndex: number;
}

