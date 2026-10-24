import {
  Controller,
  Get,
  Post,
  Render,
  Query,
  Body,
  Res,
  Session,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { StorageService } from './storage/storage.service';
import { toViewUser } from './view-user';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly storage: StorageService,
  ) {}

  private getUser(session: { user?: { name: string; username: string } }) {
    return toViewUser(session?.user ?? null);
  }

  @Get()
  @Render('index')
  getIndexPage(@Session() session: Record<string, any>) {
    const galleryImages = [
      { src: this.storage.getPublicUrl('chicken1.jpg'), alt: 'Курочка 1' },
      { src: this.storage.getPublicUrl('chicken2.jpg'), alt: 'Курочка 2' },
      { src: this.storage.getPublicUrl('chicken3.jpg'), alt: 'Курочка 3' },
      { src: this.storage.getPublicUrl('chicken4.jpg'), alt: 'Курочка 4' },
      { src: this.storage.getPublicUrl('chicken5.jpg'), alt: 'Курочка 5' },
      { src: this.storage.getPublicUrl('chicken6.jpg'), alt: 'Курочка 6' },
    ];
    const heroImageUrl = this.storage.getPublicUrl('image.png');

    const news = [
      {
        title: 'Открытие нового ресторана',
        date: '15 марта 2024',
        text: 'Мы рады сообщить об открытии нового ресторана в Санта-Фе! Приходите на открытие и получите скидку 20%.',
      },
      {
        title: 'Сезонное меню',
        date: '10 марта 2024',
        text: 'Представляем новое сезонное меню с уникальными соусами и гарнирами. Только этой весной!',
      },
      {
        title: 'Конкурс рецептов',
        date: '5 марта 2024',
        text: 'Участвуйте в нашем конкурсе и выиграйте годовой запас курочки! Подробности в ресторанах.',
      },
      {
        title: 'Обновление интерьера',
        date: '1 марта 2024',
        text: 'Завершилось обновление интерьера в нашем флагманском ресторане. Стало еще уютнее!',
      },
    ];

    const user = this.getUser(session);

    return {
      title: 'Главная',
      galleryImages,
      heroImageUrl,
      news,
      user,
    };
  }

  @Get('/restaurants')
  @Render('restaurants')
  getRestaurantsPage(@Session() session: Record<string, any>) {
    const user = this.getUser(session);
    return {
      title: 'Наши рестораны',
      user,
    };
  }

  @Get('/history')
  @Render('history')
  getHistoryPage(@Session() session: Record<string, any>) {
    const user = this.getUser(session);
    return {
      title: 'Наша история',
      user,
      gusImageUrl: this.storage.getPublicUrl('gus.jpg'),
      restaurantOldImageUrl: this.storage.getPublicUrl('restaurant_old.jpg'),
      teamEarlyImageUrl: this.storage.getPublicUrl('team_early.jpg'),
      cookingProcessImageUrl: this.storage.getPublicUrl('cooking_process.jpg'),
    };
  }

  @Get('/recipe')
  @Render('recipe')
  getRecipePage(@Session() session: Record<string, any>) {
    const user = this.getUser(session);
    return {
      title: 'Создай свой рецепт',
      user,
    };
  }

  @Get('/contacts')
  @Render('contacts')
  getContactsPage(@Session() session: Record<string, any>) {
    const user = this.getUser(session);
    return {
      title: 'Контакты',
      user,
    };
  }

  @Get('/news')
  @Render('news')
  getNewsPage(@Session() session: Record<string, any>) {
    const user = this.getUser(session);
    return {
      title: 'Новости',
      user,
    };
  }

  @Get('/login')
  @Render('login')
  getLoginPage(
    @Session() session: Record<string, any>,
    @Query('error') error?: string,
  ) {
    if (session.user) {
      return { redirect: '/' };
    }

    return {
      title: 'Вход',
      user: this.getUser(session),
      error:
        error === 'invalid' ? 'Неверное имя пользователя или пароль' : null,
    };
  }

  @Post('/login')
  postLogin(
    @Body() body: { username: string; password: string },
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');
    const user = this.authService.validateCredentials(username, password);
    if (user) {
      session.user = user;
      return res.redirect('/');
    }

    return res.redirect('/login?error=invalid');
  }

  @Get('/logout')
  logout(@Session() session: Record<string, any>, @Res() res: Response) {
    session.user = null;

    return res.redirect('/');
  }
}
