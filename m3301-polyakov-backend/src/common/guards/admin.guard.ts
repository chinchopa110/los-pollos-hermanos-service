import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as any;
    const user = session?.user;

    if (!user) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    if (user.username !== 'admin') {
      throw new UnauthorizedException('Доступ только для администратора');
    }

    return true;
  }
}
