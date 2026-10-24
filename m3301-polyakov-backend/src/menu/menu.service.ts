import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuItemRepository } from '../database/repositories/menu-item.repository';
import type { MenuItemEntity } from '../database/entities/menu-item.entity';
import { MenuEventsService } from './menu-events.service';
import { StorageService } from '../storage/storage.service';
import { paginateSlice } from '../common/pagination/paginate';
import type { MenuItemResponseDto } from './dto/menu-item-response.dto';

const CATEGORIES: MenuItemEntity['category'][] = [
  'combo',
  'chicken',
  'sides',
  'drinks',
];

@Injectable()
export class MenuService {
  constructor(
    private readonly menuItems: MenuItemRepository,
    private readonly menuEvents: MenuEventsService,
    private readonly storage: StorageService,
  ) {}

  toDto(entity: MenuItemEntity): MenuItemResponseDto {
    return {
      ...entity,
      imageUrl: entity.imageKey ? this.storage.getPublicUrl(entity.imageKey) : null,
    };
  }

  getCatalogForView(): {
    menuSections: { title: string; items: MenuItemEntity[] }[];
  } {
    const all = this.menuItems
      .findAll()
      .filter((i) => i.isAvailable)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    const itemsByCategory: Record<
      MenuItemEntity['category'],
      MenuItemEntity[]
    > = {
      combo: [],
      chicken: [],
      sides: [],
      drinks: [],
    };
    for (const item of all) {
      itemsByCategory[item.category].push(item);
    }

    const titles: Record<MenuItemEntity['category'], string> = {
      combo: 'Комбо',
      chicken: 'Курица и основное',
      sides: 'Гарниры',
      drinks: 'Напитки',
    };

    const menuSections = CATEGORIES.map((key) => ({
      title: titles[key],
      items: itemsByCategory[key],
    }));

    return { menuSections };
  }

  findAllItems(): MenuItemEntity[] {
    return this.menuItems
      .findAll()
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  findOne(id: string): MenuItemEntity {
    const item = this.menuItems.findById(id);
    if (!item) {
      throw new NotFoundException(`Позиция меню ${id} не найдена`);
    }
    return item;
  }

  findOneInCategory(
    category: MenuItemEntity['category'],
    id: string,
  ): MenuItemEntity {
    const item = this.findOne(id);
    if (item.category !== category) {
      throw new NotFoundException(
        `Позиция меню ${id} не найдена в категории «${category}»`,
      );
    }
    return item;
  }

  findAllPaginated(page: number, limit: number) {
    const all = this.findAllItems();
    return paginateSlice(all, page, limit);
  }

  findByCategoryPaginated(
    category: MenuItemEntity['category'],
    page: number,
    limit: number,
  ) {
    const all = this.menuItems
      .findByCategory(category)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return paginateSlice(all, page, limit);
  }

  findAvailablePaginated(page: number, limit: number) {
    const all = this.menuItems
      .findAll()
      .filter((i) => i.isAvailable)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return paginateSlice(all, page, limit);
  }

  findAvailableByCategoryPaginated(
    category: MenuItemEntity['category'],
    page: number,
    limit: number,
  ) {
    const all = this.menuItems
      .findByCategory(category)
      .filter((i) => i.isAvailable)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return paginateSlice(all, page, limit);
  }

  findOnePublicAvailable(id: string): MenuItemEntity {
    const item = this.menuItems.findById(id);
    if (!item || !item.isAvailable) {
      throw new NotFoundException(
        `Позиция меню ${id} не найдена или временно недоступна`,
      );
    }
    return item;
  }

  findOnePublicInCategory(
    category: MenuItemEntity['category'],
    id: string,
  ): MenuItemEntity {
    const item = this.findOnePublicAvailable(id);
    if (item.category !== category) {
      throw new NotFoundException(
        `Позиция меню ${id} не найдена в категории «${category}»`,
      );
    }
    return item;
  }

  categoryOptions(selected?: string) {
    const labels: Record<MenuItemEntity['category'], string> = {
      combo: 'Комбо',
      chicken: 'Курица',
      sides: 'Гарниры',
      drinks: 'Напитки',
    };
    return CATEGORIES.map((value) => ({
      value,
      label: labels[value],
      selected: selected === value,
    }));
  }

  parseCategory(raw: string): MenuItemEntity['category'] {
    if (CATEGORIES.includes(raw as MenuItemEntity['category'])) {
      return raw as MenuItemEntity['category'];
    }
    throw new BadRequestException('Некорректная категория');
  }

  parsePriceRub(raw: string | number): number {
    const n =
      typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) {
      throw new BadRequestException('Некорректная цена');
    }
    return Math.round(n);
  }

  parseBoolean(raw: string | undefined, defaultValue = true): boolean {
    if (raw === undefined || raw === '') return defaultValue;
    return raw === 'true' || raw === 'on' || raw === '1';
  }

  private assertNonEmpty(field: string, value: string, label: string): void {
    if (!value || !value.trim()) {
      throw new BadRequestException(`${label} обязательно`);
    }
    if (value.length > 500 && field === 'description') {
      throw new BadRequestException('Описание слишком длинное');
    }
    if (value.length > 120 && field === 'name') {
      throw new BadRequestException('Название слишком длинное');
    }
  }

  async create(input: {
    name: string;
    description: string;
    priceRub: number;
    category: MenuItemEntity['category'];
    imageKey: string | null;
    isAvailable: boolean;
  }): Promise<MenuItemEntity> {
    this.assertNonEmpty('name', input.name, 'Название');
    this.assertNonEmpty('description', input.description, 'Описание');
    const item = await this.menuItems.create({
      ...input,
      name: input.name.trim(),
      description: input.description.trim(),
    });
    this.menuEvents.emit({
      type: 'created',
      item: { id: item.id, name: item.name },
    });
    return item;
  }

  async update(
    id: string,
    patch: Partial<
      Pick<
        MenuItemEntity,
        | 'name'
        | 'description'
        | 'priceRub'
        | 'category'
        | 'imageKey'
        | 'isAvailable'
      >
    >,
  ): Promise<MenuItemEntity> {
    const existing = this.findOne(id);
    if (patch.name !== undefined) {
      this.assertNonEmpty('name', patch.name, 'Название');
      patch.name = patch.name.trim();
    }
    if (patch.description !== undefined) {
      this.assertNonEmpty('description', patch.description, 'Описание');
      patch.description = patch.description.trim();
    }
    const next: MenuItemEntity = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
    };
    const saved = await this.menuItems.save(next);
    this.menuEvents.emit({
      type: 'updated',
      item: { id: saved.id, name: saved.name },
    });
    return saved;
  }

  async remove(id: string): Promise<void> {
    const existing = this.menuItems.findById(id);
    if (!existing) {
      throw new NotFoundException(`Позиция меню ${id} не найдена`);
    }
    await this.menuItems.deleteById(id);
    this.menuEvents.emit({
      type: 'deleted',
      item: { id: existing.id, name: existing.name },
    });
  }
}
