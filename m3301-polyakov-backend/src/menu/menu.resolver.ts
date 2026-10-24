import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { MenuService } from './menu.service';
import { StorageService } from '../storage/storage.service';
import { MenuItem } from './graphql/menu-item.type';
import { PaginatedMenuItems } from './graphql/paginated-menu-items.type';
import { CreateMenuItemInput } from './graphql/create-menu-item.input';
import { UpdateMenuItemInput } from './graphql/update-menu-item.input';
import { MenuCategory } from './graphql/menu-category.enum';
import { totalPages } from '../common/pagination/paginate';
import type { MenuItemEntity } from '../database/entities/menu-item.entity';

function toGql(entity: MenuItemEntity): MenuItem {
  return entity as unknown as MenuItem;
}

@Resolver(() => MenuItem)
export class MenuResolver {
  constructor(
    private readonly menuService: MenuService,
    private readonly storageService: StorageService,
  ) {}

  @Query(() => [MenuItem], {
    name: 'menuItems',
    description: 'Получить все позиции меню (отсортированы по названию)',
    complexity: 5,
  })
  findAll(): MenuItem[] {
    return this.menuService.findAllItems().map(toGql);
  }

  @Query(() => PaginatedMenuItems, {
    name: 'menuItemsPaginated',
    description: 'Получить позиции меню с пагинацией',
    complexity: ({ args, childComplexity }) =>
      childComplexity * (args['limit'] ?? 10) + 1,
  })
  findAllPaginated(
    @Args('page', { type: () => Int, defaultValue: 1, description: 'Номер страницы (начиная с 1)' })
    page: number,
    @Args('limit', { type: () => Int, defaultValue: 10, description: 'Количество элементов на странице' })
    limit: number,
  ): PaginatedMenuItems {
    const result = this.menuService.findAllPaginated(page, limit);
    return {
      data: result.data.map(toGql),
      total: result.total,
      page,
      limit,
      totalPages: totalPages(result.total, limit),
    };
  }

  @Query(() => PaginatedMenuItems, {
    name: 'menuItemsByCategory',
    description: 'Получить позиции меню по категории с пагинацией',
    complexity: ({ args, childComplexity }) =>
      childComplexity * (args['limit'] ?? 10) + 1,
  })
  findByCategory(
    @Args('category', { type: () => MenuCategory, description: 'Категория меню' })
    category: MenuCategory,
    @Args('page', { type: () => Int, defaultValue: 1, description: 'Номер страницы' })
    page: number,
    @Args('limit', { type: () => Int, defaultValue: 10, description: 'Количество элементов на странице' })
    limit: number,
  ): PaginatedMenuItems {
    const result = this.menuService.findByCategoryPaginated(
      category as unknown as MenuItemEntity['category'],
      page,
      limit,
    );
    return {
      data: result.data.map(toGql),
      total: result.total,
      page,
      limit,
      totalPages: totalPages(result.total, limit),
    };
  }

  @Query(() => PaginatedMenuItems, {
    name: 'availableMenuItems',
    description: 'Получить только доступные позиции меню с пагинацией',
    complexity: ({ args, childComplexity }) =>
      childComplexity * (args['limit'] ?? 10) + 1,
  })
  findAvailable(
    @Args('page', { type: () => Int, defaultValue: 1, description: 'Номер страницы' })
    page: number,
    @Args('limit', { type: () => Int, defaultValue: 10, description: 'Количество элементов на странице' })
    limit: number,
  ): PaginatedMenuItems {
    const result = this.menuService.findAvailablePaginated(page, limit);
    return {
      data: result.data.map(toGql),
      total: result.total,
      page,
      limit,
      totalPages: totalPages(result.total, limit),
    };
  }

  @Query(() => MenuItem, {
    name: 'menuItem',
    description: 'Получить позицию меню по идентификатору',
    complexity: 2,
  })
  findOne(
    @Args('id', { type: () => ID, description: 'Идентификатор позиции меню' })
    id: string,
  ): MenuItem {
    return toGql(this.menuService.findOne(id));
  }

  @Mutation(() => MenuItem, {
    description: 'Создать новую позицию меню',
    complexity: 3,
  })
  async createMenuItem(
    @Args('input', { description: 'Данные новой позиции меню' })
    input: CreateMenuItemInput,
  ): Promise<MenuItem> {
    const item = await this.menuService.create({
      name: input.name,
      description: input.description,
      priceRub: input.priceRub,
      category: input.category as unknown as MenuItemEntity['category'],
      imageKey: input.imageKey ?? null,
      isAvailable: input.isAvailable,
    });
    return toGql(item);
  }

  @Mutation(() => MenuItem, {
    description: 'Обновить данные позиции меню',
    complexity: 3,
  })
  async updateMenuItem(
    @Args('id', { type: () => ID, description: 'Идентификатор позиции меню' })
    id: string,
    @Args('input', { description: 'Обновляемые поля позиции меню' })
    input: UpdateMenuItemInput,
  ): Promise<MenuItem> {
    const patch: Partial<MenuItemEntity> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.priceRub !== undefined) patch.priceRub = input.priceRub;
    if (input.category !== undefined)
      patch.category = input.category as unknown as MenuItemEntity['category'];
    if (input.imageKey !== undefined) patch.imageKey = input.imageKey;
    const item = await this.menuService.update(id, patch);
    return toGql(item);
  }

  @Mutation(() => MenuItem, {
    description: 'Сделать позицию меню доступной для заказа',
    complexity: 2,
  })
  async makeMenuItemAvailable(
    @Args('id', { type: () => ID, description: 'Идентификатор позиции меню' })
    id: string,
  ): Promise<MenuItem> {
    const item = await this.menuService.update(id, { isAvailable: true });
    return toGql(item);
  }

  @Mutation(() => MenuItem, {
    description: 'Скрыть позицию меню (сделать недоступной для заказа)',
    complexity: 2,
  })
  async hideMenuItem(
    @Args('id', { type: () => ID, description: 'Идентификатор позиции меню' })
    id: string,
  ): Promise<MenuItem> {
    const item = await this.menuService.update(id, { isAvailable: false });
    return toGql(item);
  }

  @Mutation(() => Boolean, {
    description: 'Удалить позицию меню по идентификатору',
    complexity: 2,
  })
  async removeMenuItem(
    @Args('id', { type: () => ID, description: 'Идентификатор позиции меню' })
    id: string,
  ): Promise<boolean> {
    await this.menuService.remove(id);
    return true;
  }

  @ResolveField(() => String, {
    nullable: true,
    description: 'Публичный URL изображения в Yandex Object Storage',
    complexity: 1,
  })
  imageUrl(@Parent() item: MenuItem): string | null {
    const entity = item as unknown as { imageKey?: string | null };
    return entity.imageKey ? this.storageService.getPublicUrl(entity.imageKey) : null;
  }
}
