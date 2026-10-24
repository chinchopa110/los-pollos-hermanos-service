import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class AdminMenuMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const session = req.session as { user?: { username?: string } };
    const user = session?.user;
    if (user?.username === 'admin') {
      next();
      return;
    }
    if (req.path.startsWith('/api')) {
      res.status(401).json({
        statusCode: 401,
        message: 'Требуется вход под учётной записью администратора',
        error: 'Unauthorized',
      });
      return;
    }
    res.redirect(302, '/login');
  }
}
