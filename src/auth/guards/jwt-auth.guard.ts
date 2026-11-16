import { ExecutionContext, Injectable, Logger, Optional, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger('JwtAuthGuard');

  constructor(@Optional() options?: any) {
    super(options);
    // it inherits from Passport AuthGuard 
    // @Optional is a nestjs DI decorator it tells that decorated constructor parameter is optional 
  }


  override canActivate(context: ExecutionContext) {
  
  // override replacing customizing the canActive() method that exists in the parent class   

    const req = context.switchToHttp().getRequest();
    // i use switchHttp to access the http context and getRequest() to obtain the request object to access request information such as headers,URL,params , body 

    this.logger.log(
      `[GUARD] JwtAuthGuard - canActivate() started for ${req.method} ${req.originalUrl}`,
    );
    this.logger.log(`[GUARD] JwtAuthGuard - Verifying JWT authentication`);

    return super.canActivate(context);
    // the actual jwt authentication back to parent guard and returning its result allows nestJs to continue or reject the request 
  }

  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

  // here the place where nest gives you the result and lets decide what should happen 
  // err : did the authentication itself produce an error
  // user : who was authenticated
  // info : why did authentication failed

    if (err || !user) {
      const reason = info?.message || err?.message || 'Unauthorized access';
      this.logger.warn(
        `[GUARD] JwtAuthGuard - JWT authentication FAILED: ${reason}`,
      );
      throw err || new UnauthorizedException(reason);
    }

    this.logger.log(
      `[GUARD] JwtAuthGuard - JWT authentication successful (User ID: ${user.id}, Role: ${user.role})`,
    );

    return user;
  }
}

