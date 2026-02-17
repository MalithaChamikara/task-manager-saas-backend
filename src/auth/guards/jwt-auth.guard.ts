import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard will be used to protect routes that require authentication using JWT.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
