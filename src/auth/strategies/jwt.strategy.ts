import {  Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../../users/users.service.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
) {
constructor(private readonly usersService : UsersService) {

    super({

        // Extracts the jwt from :
        // Authorization : Bearer <token>
        jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),

        // rejects the token if its expiration time has completed 
        ignoreExpiration : false,

        // secret used to verify the jwt signature 
        secretOrKey : 'my-access-secret',
    })

}

// passprt calls validate() after the jwt has been successfully verified 
async validate (payload : any) {
     
        const user = await this.usersService.findById(
            payload.sub,
        )

        if(!user) {
            throw new UnauthorizedException(
                'user not found'
            );
        }

        return {
            id : user.id,
            name : user.name,
            email : user.email,
            role : user.role
        }
    }
}


