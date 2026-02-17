import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Define the shape of the JWT payload
export type JwtPayload = {
    sub: string;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        // Get the JWT secret from the configuration
        const accessSecret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!accessSecret) {
            throw new Error('JWT_ACCESS_SECRET is not set');
        }

        // Call the super constructor with the JWT strategy options
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: accessSecret,
        });
    }

    // Validate the JWT payload and return the user information
    async validate(payload: JwtPayload) {
        return {
            userId: payload.sub,
            email: payload.email,
        };
    }
}