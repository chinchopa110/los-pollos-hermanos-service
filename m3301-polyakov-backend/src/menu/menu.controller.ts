import { Controller, Get, Render, Session, Sse } from '@nestjs/common';
import { merge, Observable, of } from 'rxjs';
import { ApiExcludeController } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { MenuEventsService } from './menu-events.service';
import { StorageService } from '../storage/storage.service';
import { toViewUser } from '../view-user';

type SessionData = { user?: { name: string; username: string } };

@ApiExcludeController()
@Controller()
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly menuEvents: MenuEventsService,
    private readonly storage: StorageService,
  ) {}

  @Sse('menu/notifications')
  menuNotifications(): Observable<{ data: string }> {
    return merge(
      of({
        data: JSON.stringify({
          type: 'connected',
          message: 'Поток открыт, ждём изменения меню…',
        }),
      }),
      this.menuEvents.observe(),
    );
  }

  @Get('menu')
  @Render('menu')
  getMenuPage(@Session() session: SessionData) {
    const user = toViewUser(session.user ?? null);
    const { menuSections } = this.menuService.getCatalogForView();
    
    const sectionsWithUrls = menuSections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        imageUrl: item.imageKey ? this.storage.getPublicUrl(item.imageKey) : null,
      })),
    }));
    return {
      title: 'Меню',
      user,
      menuSections: sectionsWithUrls,
      loadToastr: true,
    };
  }
}
