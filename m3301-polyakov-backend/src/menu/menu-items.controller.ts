import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Redirect,
  Render,
  Session,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { StorageService } from '../storage/storage.service';
import { toViewUser } from '../view-user';

type SessionData = { user?: { name: string; username: string } };

@ApiExcludeController()
@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuService: MenuService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @Render('menu-items/index')
  list(@Session() session: SessionData) {
    const items = this.menuService.findAllItems().map((item) => ({
      ...item,
      imageUrl: item.imageKey ? this.storage.getPublicUrl(item.imageKey) : null,
    }));
    return {
      title: 'Администрирование',
      user: toViewUser(session.user ?? null),
      items,
    };
  }

  @Get('add')
  @Render('menu-items/form')
  addForm(@Session() session: SessionData) {
    return {
      title: 'Новая позиция меню',
      user: toViewUser(session.user ?? null),
      isEdit: false,
      item: null,
      categoryOptions: this.menuService.categoryOptions(),
    };
  }

  @Get(':id/edit')
  @Render('menu-items/form')
  editForm(@Param('id') id: string, @Session() session: SessionData) {
    const item = this.menuService.findOne(id);
    return {
      title: `Редактирование: ${item.name}`,
      user: toViewUser(session.user ?? null),
      isEdit: true,
      item,
      categoryOptions: this.menuService.categoryOptions(item.category),
    };
  }

  @Get(':id')
  @Render('menu-items/show')
  show(@Param('id') id: string, @Session() session: SessionData) {
    const entity = this.menuService.findOne(id);
    const item = {
      ...entity,
      imageUrl: entity.imageKey ? this.storage.getPublicUrl(entity.imageKey) : null,
    };
    return {
      title: item.name,
      user: toViewUser(session.user ?? null),
      item,
    };
  }

  @Post()
  @Redirect()
  async create(
    @Body()
    body: {
      name: string;
      description: string;
      priceRub: string;
      category: string;
      imageKey?: string;
      isAvailable?: string;
    },
  ) {
    const item = await this.menuService.create({
      name: String(body.name ?? '').trim(),
      description: String(body.description ?? '').trim(),
      priceRub: this.menuService.parsePriceRub(body.priceRub),
      category: this.menuService.parseCategory(String(body.category ?? '')),
      imageKey: String(body.imageKey ?? '').trim() || null,
      isAvailable: this.menuService.parseBoolean(body.isAvailable, true),
    });
    return { url: `/menu-items/${item.id}` };
  }

  @Patch(':id')
  @Redirect()
  async patch(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      priceRub?: string;
      category?: string;
      imageKey?: string;
      isAvailable?: string;
    },
  ) {
    const patch: Parameters<MenuService['update']>[1] = {};
    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.description !== undefined) {
      patch.description = String(body.description).trim();
    }
    if (body.priceRub !== undefined) {
      patch.priceRub = this.menuService.parsePriceRub(body.priceRub);
    }
    if (body.category !== undefined) {
      patch.category = this.menuService.parseCategory(String(body.category));
    }
    if (body.imageKey !== undefined) {
      patch.imageKey = String(body.imageKey).trim() || null;
    }
    if (body.isAvailable !== undefined) {
      patch.isAvailable = this.menuService.parseBoolean(body.isAvailable, true);
    }
    await this.menuService.update(id, patch);
    return { url: `/menu-items/${id}` };
  }

  @Post(':id/update')
  @Redirect()
  async updateViaForm(
    @Param('id') id: string,
    @Body()
    body: {
      name: string;
      description: string;
      priceRub: string;
      category: string;
      imageKey?: string;
      isAvailable?: string;
    },
  ) {
    await this.menuService.update(id, {
      name: String(body.name ?? '').trim(),
      description: String(body.description ?? '').trim(),
      priceRub: this.menuService.parsePriceRub(body.priceRub),
      category: this.menuService.parseCategory(String(body.category ?? '')),
      imageKey: String(body.imageKey ?? '').trim() || null,
      isAvailable: this.menuService.parseBoolean(body.isAvailable, true),
    });
    return { url: `/menu-items/${id}` };
  }

  @Delete(':id')
  @Redirect()
  async remove(@Param('id') id: string) {
    await this.menuService.remove(id);
    return { url: '/menu-items' };
  }

  @Post(':id/delete')
  @Redirect()
  async removeViaForm(@Param('id') id: string) {
    await this.menuService.remove(id);
    return { url: '/menu-items' };
  }
}
