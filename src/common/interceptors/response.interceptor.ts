import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../../auth/decorators/response-message.decorator.js';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ResponseInterceptor');

  constructor(
    private readonly reflector : Reflector
  ){}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const message =
      this.reflector.getAllAndOverride<string>(
        RESPONSE_MESSAGE_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? 'Request successful';

    this.logger.log(
      `[INTERCEPTOR] ResponseInterceptor - BEFORE controller execution`,
    );

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `[INTERCEPTOR] ResponseInterceptor - AFTER controller execution (Response transformation | Status: ${res.statusCode} | Duration: ${duration}ms)`,
        );

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}


// advantages :
// 1) less duplicate code 

// 2) centrailzed behaviour : if any change required we can change in the interceptor instead of hundres of controllers 

// 3) seperation :
// controller handles Http related responsibilities
// service handles business logic

// another approaches :

// approach 1 : manual response formating 
// approach 2 : Response DTO 

// export class ApiResponseDto<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }

