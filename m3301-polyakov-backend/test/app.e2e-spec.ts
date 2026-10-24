import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { create } from 'express-handlebars';
import session from 'express-session';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    app.use(
      session({
        secret: 'e2e-test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );

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

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('Los Pollos Hermanos');
      });
  });
});
