
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  // interface that defines the structure of an exception filter
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    // argumentHost provides current request 
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let data : unknown = null

    if (exception instanceof HttpException) {
      // Handle NestJS exceptions, such as NotFoundException
      // and BadRequestException.
      status = exception.getStatus();
      // retrieves the http status code 

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        if ('message' in exceptionResponse) {
          const responseMessage = exceptionResponse.message;

        if (typeof responseMessage === 'string') {
          message = responseMessage;
        } else if (Array.isArray(responseMessage)) {
          message = responseMessage
            .filter(
              (item): item is string => typeof item === 'string',
            )
            .join(', ');
        }
      } // Preserve additional error details from the exception
        if ('errors' in exceptionResponse) {
          data = {
            errors: exceptionResponse.errors,
          };
        }
      }
    }

    // Log the error for debugging without exposing internal details.
    
    // in the API response.
    this.logger.error(
      `[EXCEPTION FILTER] Status: ${status} | Path: ${request.method} ${request.originalUrl} | Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      message,
      data,
    });
  }
}
