import { Injectable } from '@nestjs/common';
import type { MenuItemEntity } from '../entities/menu-item.entity';

@Injectable()
export class MenuItemRepository {
  private readonly store = new Map<string, MenuItemEntity>();

  constructor() {
    const t = (iso: string) => new Date(iso);
    const seed: MenuItemEntity[] = [
      {
        id: 'seed-ch-1',
        name: 'Баскет острый',
        description: 'Классика в остром исполнении, хрустящая корочка.',
        priceRub: 499,
        category: 'chicken',
        imageKey: 'chicken1.jpg',
        isAvailable: true,
        createdAt: t('2024-01-10T12:00:00'),
        updatedAt: t('2024-01-10T12:00:00'),
      },
      {
        id: 'seed-ch-2',
        name: 'Баскет оригинальный',
        description: 'Фирменная панировка Los Pollos, сочное мясо внутри.',
        priceRub: 479,
        category: 'chicken',
        imageKey: 'chicken2.jpg',
        isAvailable: true,
        createdAt: t('2024-01-11T12:00:00'),
        updatedAt: t('2024-01-11T12:00:00'),
      },
      {
        id: 'seed-ch-3',
        name: 'Крылышки BBQ',
        description: 'Копчёный соус барбекю, идеально к пиву и компании.',
        priceRub: 389,
        category: 'chicken',
        imageKey: 'chicken3.jpg',
        isAvailable: true,
        createdAt: t('2024-01-12T12:00:00'),
        updatedAt: t('2024-01-12T12:00:00'),
      },
      {
        id: 'seed-ch-4',
        name: 'Стрипсы нежные',
        description: 'Длинные кусочки филе, меньше масла — тот же вкус.',
        priceRub: 429,
        category: 'chicken',
        imageKey: 'chicken4.jpg',
        isAvailable: true,
        createdAt: t('2024-01-13T12:00:00'),
        updatedAt: t('2024-01-13T12:00:00'),
      },
      {
        id: 'seed-ch-5',
        name: 'Ножки в хрустящей панировке',
        description: 'Порция из пяти ножек, соус на выбор.',
        priceRub: 349,
        category: 'chicken',
        imageKey: 'chicken5.jpg',
        isAvailable: true,
        createdAt: t('2024-01-14T12:00:00'),
        updatedAt: t('2024-01-14T12:00:00'),
      },
      {
        id: 'seed-cb-1',
        name: 'Комбо «Санта-Фе»',
        description: 'Напиток + картофель + курица — наш бестселлер.',
        priceRub: 649,
        category: 'combo',
        imageKey: 'chicken6.jpg',
        isAvailable: true,
        createdAt: t('2024-02-01T12:00:00'),
        updatedAt: t('2024-02-01T12:00:00'),
      },
      {
        id: 'seed-cb-2',
        name: 'Комбо «Дуэт»',
        description: 'Два бургера, две порции картофеля и два напитка.',
        priceRub: 899,
        category: 'combo',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-02-02T12:00:00'),
        updatedAt: t('2024-02-02T12:00:00'),
      },
      {
        id: 'seed-cb-3',
        name: 'Комбо «Семейный стол»',
        description: 'Большой баскет, гарниры на четверых и литр напитка.',
        priceRub: 1899,
        category: 'combo',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-02-03T12:00:00'),
        updatedAt: t('2024-02-03T12:00:00'),
      },
      {
        id: 'seed-cb-4',
        name: 'Ланч-набор «Обед»',
        description: 'Стрипсы, салат, булка и напиток до 16:00.',
        priceRub: 459,
        category: 'combo',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-02-04T12:00:00'),
        updatedAt: t('2024-02-04T12:00:00'),
      },
      {
        id: 'seed-cb-5',
        name: 'Комбо «Дорога домой»',
        description: 'Закуска в дорогу: крылышки, картофель, соусы.',
        priceRub: 559,
        category: 'combo',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-02-05T12:00:00'),
        updatedAt: t('2024-02-05T12:00:00'),
      },
      {
        id: 'seed-sd-1',
        name: 'Картофель фри большой',
        description: 'Золотистый, солёный, порция L.',
        priceRub: 199,
        category: 'sides',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-03-01T12:00:00'),
        updatedAt: t('2024-03-01T12:00:00'),
      },
      {
        id: 'seed-sd-2',
        name: 'Салат коул-слоу',
        description: 'Свежая капуста, морковь, лёгкий майонезный соус.',
        priceRub: 129,
        category: 'sides',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-03-02T12:00:00'),
        updatedAt: t('2024-03-02T12:00:00'),
      },
      {
        id: 'seed-sd-3',
        name: 'Кукуруза гриль',
        description: 'Початок с маслом и зеленью.',
        priceRub: 149,
        category: 'sides',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-03-03T12:00:00'),
        updatedAt: t('2024-03-03T12:00:00'),
      },
      {
        id: 'seed-sd-4',
        name: 'Наггетсы, 6 шт.',
        description: 'Классические куриные наггетсы с кисло-сладким соусом.',
        priceRub: 229,
        category: 'sides',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-03-04T12:00:00'),
        updatedAt: t('2024-03-04T12:00:00'),
      },
      {
        id: 'seed-sd-5',
        name: 'Луковые кольца',
        description: 'В кляре, хрустят и идеально заходят к соусу барбекю.',
        priceRub: 179,
        category: 'sides',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-03-05T12:00:00'),
        updatedAt: t('2024-03-05T12:00:00'),
      },
      {
        id: 'seed-dr-1',
        name: 'Кола 0,5 л',
        description: 'Освежающий газированный напиток.',
        priceRub: 149,
        category: 'drinks',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-04-01T12:00:00'),
        updatedAt: t('2024-04-01T12:00:00'),
      },
      {
        id: 'seed-dr-2',
        name: 'Лимонад домашний',
        description: 'Цитрус, мята, лёд — готовим на месте.',
        priceRub: 189,
        category: 'drinks',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-04-02T12:00:00'),
        updatedAt: t('2024-04-02T12:00:00'),
      },
      {
        id: 'seed-dr-3',
        name: 'Холодный чай',
        description: 'Чёрный или зелёный, с лимоном, без сахара по желанию.',
        priceRub: 139,
        category: 'drinks',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-04-03T12:00:00'),
        updatedAt: t('2024-04-03T12:00:00'),
      },
      {
        id: 'seed-dr-4',
        name: 'Морс ягодный',
        description: 'Смородина и клюква, охлаждённый.',
        priceRub: 159,
        category: 'drinks',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-04-04T12:00:00'),
        updatedAt: t('2024-04-04T12:00:00'),
      },
      {
        id: 'seed-dr-5',
        name: 'Кофе американо',
        description: 'Крепкий зерновой кофе, можно с молоком.',
        priceRub: 169,
        category: 'drinks',
        imageKey: null,
        isAvailable: true,
        createdAt: t('2024-04-05T12:00:00'),
        updatedAt: t('2024-04-05T12:00:00'),
      },
    ];
    for (const item of seed) {
      this.store.set(item.id, item);
    }
  }

  findAll(): MenuItemEntity[] {
    return [...this.store.values()];
  }

  findById(id: string): MenuItemEntity | undefined {
    return this.store.get(id);
  }

  findByCategory(category: MenuItemEntity['category']): MenuItemEntity[] {
    return this.findAll().filter((item) => item.category === category);
  }

  create(
    input: Omit<MenuItemEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MenuItemEntity> {
    const id = `mi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    const row: MenuItemEntity = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id, row);
    return Promise.resolve(row);
  }

  save(entity: MenuItemEntity): Promise<MenuItemEntity> {
    const existing = this.store.get(entity.id);
    const createdAt = existing?.createdAt ?? entity.createdAt ?? new Date();
    const row: MenuItemEntity = {
      ...entity,
      createdAt,
      updatedAt: new Date(),
    };
    this.store.set(entity.id, row);
    return Promise.resolve(row);
  }

  deleteById(id: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }
}
