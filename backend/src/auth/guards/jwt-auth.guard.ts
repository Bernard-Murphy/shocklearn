import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    // Handle REST requests
    const request = context.switchToHttp().getRequest();
    if (request) {
      return request;
    }

    // Handle GraphQL requests
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

