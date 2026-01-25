import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    
    // Handle REST requests
    if (request) {
      return request.user;
    }

    // Handle GraphQL requests
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

