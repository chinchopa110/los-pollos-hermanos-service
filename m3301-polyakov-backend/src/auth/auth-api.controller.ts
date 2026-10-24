import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RestApiTags } from '../common/swagger/rest-api-tags';
import { AuthService, type SessionUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/auth-user.dto';
import {
  AuditLog,
  AuditLogInterceptor,
} from '../common/interceptors/audit-log.interceptor';

type SessionWithUser = {
  user?: SessionUser | null;
};

@ApiTags(RestApiTags.auth)
@Controller('api/auth')
@UseInterceptors(AuditLogInterceptor)
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @AuditLog({
    actionType: 'LOGIN',
    entityType: 'user',
    getEntityId: (data) => data?.user?.username || null,
    getMetadata: (data) => ({ username: data?.user?.username }),
  })
  @ApiOperation({
    summary: 'Вход по логину и паролю',
    description:
      'Устанавливает cookie сессии (`connect.sid`), как форма на `/login`. Дальнейшие запросы с этим cookie считаются авторизованными.',
  })
  @ApiOkResponse({ type: LoginResponseDto, description: 'Успешный вход' })
  @ApiBadRequestResponse({ description: 'Некорректное тело запроса' })
  @ApiUnauthorizedResponse({
    description: 'Неверная пара логин/пароль',
  })
  login(@Body() dto: LoginDto, @Req() req: Request): LoginResponseDto {
    const user = this.authService.validateCredentials(
      dto.username.trim(),
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }
    const session = req.session as SessionWithUser;
    session.user = user;
    return { user };
  }

  @Post('logout')
  @HttpCode(204)
  @AuditLog({
    actionType: 'LOGOUT',
    entityType: 'user',
  })
  @ApiOperation({
    summary: 'Выход',
    description: 'Очищает пользователя в сессии (как GET `/logout` на сайте).',
  })
  @ApiNoContentResponse({
    description: 'Сессия сброшена для текущего пользователя',
  })
  logout(@Req() req: Request): void {
    const session = req.session as SessionWithUser;
    session.user = null;
  }
}
