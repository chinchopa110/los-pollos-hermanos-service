import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { create } from 'express-handlebars';
import session from 'express-session';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RestApiTags } from './common/swagger/rest-api-tags';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'https://studio.apollographql.com',
      'http://localhost:3000',
      'https://m3301-polyakov-backend.onrender.com',
    ],
    credentials: true,
  });

  app.use(
    session({
      secret: 'los-pollos-hermanos-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Los Pollos Hermanos API')
    .setDescription(
      [
        '**Вход (сессия).** `POST /api/auth/login` с JSON `{ "username", "password" }` или форма на `/login`.',
        'После успешного входа cookie `connect.sid` уходит с запросами (в Swagger — из того же браузера). Выход: `POST /api/auth/logout`.',
        '',
        '**Меню без авторизации.** Как страница `/menu` — только доступные позиции: `GET /api/menu/items` и вложенные `GET /api/menu/categories/{category}/items`.',
        'Админка (полный список, в т.ч. недоступные позиции): `GET /api/menu-items` и `GET /api/menu-items/categories/{category}/items` — нужен admin.',
        '',
        'Пагинация: `page`, `limit`; ссылки prev/next в заголовке `Link`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addCookieAuth('session', {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
      description:
        'Появляется после успешного POST /api/auth/login или POST /login.',
    })
    .addTag(
      RestApiTags.auth,
      '`POST /api/auth/login`, `POST /api/auth/logout` — сессия как на сайте.',
    )
    .addTag(
      RestApiTags.menuAdmin,
      '`/api/menu-items`, `/api/menu-items/categories/...` — полный CRUD и списки (нужен admin).',
    )
    .addTag(
      RestApiTags.menuCatalog,
      '`/api/menu/items`, `/api/menu/categories/...` — только доступные позиции, без авторизации.',
    )
    .addTag(
      RestApiTags.feedback,
      '`/api/feedback` — отзывы; изменение и удаление по правилам сессии, как на сайте.',
    )
    .addTag(
      RestApiTags.admin,
      '`/api/admin/audit-log` — аудит лог действий пользователей (только для администратора).',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const hbs = create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: join(__dirname, '..', 'views'),
    partialsDir: join(__dirname, '..', 'views', 'partials'),
  });

  app.engine('hbs', hbs.engine);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
