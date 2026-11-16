import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedUser } from "../interface/authenticated-user.interface.js";

export const currentUser = createParamDecorator(
    (data : unknown , ctx : ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as AuthenticatedUser
    }
)


// authenticated user's information directly inside a controller method without repeatedly extracting request.user 

// createParamDecorator : creates a custom decorator that can be used to extract a value from controller 

// registers the function that extracts the value for the controller parameter 