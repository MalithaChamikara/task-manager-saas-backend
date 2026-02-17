import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // auth/register
    // user registration endpoint with rate limiting to prevent abuse
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { ttl: 60, limit: 5 } })
    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.register(dto.email, dto.password);

        res.cookie(
            this.authService.getRefreshCookieName(),
            result.refreshToken,
            this.authService.getRefreshCookieOptions(),
        );

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    // auth/login
    // user login endpoint with rate limiting to prevent brute-force attacks
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { ttl: 60, limit: 5 } })
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto.email, dto.password);

        res.cookie(
            this.authService.getRefreshCookieName(),
            result.refreshToken,
            this.authService.getRefreshCookieOptions(),
        );

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    // auth/refresh
    // endpoint to refresh access tokens using a valid refresh token, with rate limiting to prevent abuse

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { ttl: 60, limit: 10 } })
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = (req as any).cookies?.[this.authService.getRefreshCookieName()];
        const result = await this.authService.refresh(refreshToken);

        res.cookie(
            this.authService.getRefreshCookieName(),
            result.refreshToken,
            this.authService.getRefreshCookieOptions(),
        );

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    // auth/me
    // protected endpoint to get current user info, requires a valid access token
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
        return {
            user: req.user,
        };
    }

    // auth/logout
    // protected endpoint to log out the user by clearing the refresh token cookie 
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(
        @Req() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.logout(req.user.userId);
        res.clearCookie(this.authService.getRefreshCookieName(), {
            ...this.authService.getRefreshCookieOptions(),
            maxAge: 0,
        });
        return { ok: true };
    }
}