import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
// creating and verifying jwt tokens 
import { LoginUserDto } from './dto/login-user.dto.js';

import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService : UsersService,
        private readonly jwtService : JwtService,
    ){}

    async login(loginUserDto:LoginUserDto){
        const {email,password} = loginUserDto;
        this.logger.log(`[SERVICE] AuthService.login - Looking up user by email: ${email}`);

        const user = await this.usersService.findByEmail(email);

        if(!user){
            this.logger.warn(`[SERVICE] AuthService.login - User not found for email: ${email}`);
            throw new UnauthorizedException(
                'Invalid credentials'
            );
        }

        this.logger.log(`[SERVICE] AuthService.login - Comparing password hash for user ID: ${user.id}`);
        
        const ispasswordValid = await bcrypt.compare(password,user.password);

        if(!ispasswordValid) {
            this.logger.warn(`[SERVICE] AuthService.login - Invalid password for user ID: ${user.id}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`[SERVICE] AuthService.login - Password valid. Generating access and refresh tokens`);
        
        const payload = {
            sub : user.id,
            email : user.email,
            role : user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload,
            {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
            }
        );

        const refreshToken = await this.jwtService.signAsync(payload,
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
            }
        );

        this.logger.log(`[SERVICE] AuthService.login - Authentication successful for user ID: ${user.id}`);

        return {
            access_token : accessToken,
            refresh_token : refreshToken
        };
    }

    async refreshAccessToken(refreshToken : string){
        this.logger.log(`[SERVICE] AuthService.refreshAccessToken - Verifying refresh token`);

        try {
            const payload = await this.jwtService.verifyAsync(refreshToken , {
                secret: process.env.JWT_REFRESH_SECRET || 'my-refresh-secret',
            });

            this.logger.log(`[SERVICE] AuthService.refreshAccessToken - Refresh token valid for user ID: ${payload.sub}`);

            const newPayload = {
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            const accessToken = await this.jwtService.signAsync(newPayload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
            });

            this.logger.log(`[SERVICE] AuthService.refreshAccessToken - New access token generated successfully`);

            return {
                access_token : accessToken
            };

        } catch (error){
            this.logger.warn(`[SERVICE] AuthService.refreshAccessToken - Invalid or expired refresh token`);
            throw new UnauthorizedException(
                'Invalid or expired refresh token',
            );
        }
    }
}

