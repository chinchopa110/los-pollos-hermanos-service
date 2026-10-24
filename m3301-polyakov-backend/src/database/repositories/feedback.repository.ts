import { Injectable } from '@nestjs/common';
import type { FeedbackEntity } from '../entities/feedback.entity';

@Injectable()
export class FeedbackRepository {
  private readonly store = new Map<string, FeedbackEntity>();

  constructor() {
    const seed: FeedbackEntity[] = [
      {
        id: 'fb-seed-1',
        authorName: 'Мария Волкова',
        email: 'maria.v@example.com',
        rating: 5,
        message:
          'Заказывали семейное комбо на выходных — всё горячее, вкусно и очень сытно. Обязательно вернёмся!',
        ownerUsername: null,
        createdAt: new Date('2024-11-02T14:30:00'),
      },
      {
        id: 'fb-seed-2',
        authorName: 'Игорь Семёнов',
        email: 'igor.s@example.com',
        rating: 4,
        message:
          'Быстрая выдача, курица хрустящая. Минус звезда только за очередь в пятницу вечером.',
        ownerUsername: null,
        createdAt: new Date('2024-10-18T19:00:00'),
      },
      {
        id: 'fb-seed-3',
        authorName: 'Анна Ким',
        email: 'anna.kim@example.com',
        rating: 5,
        message:
          'Любим баскет острый и луковые кольца. Персонал вежливый, зал чистый.',
        ownerUsername: null,
        createdAt: new Date('2024-09-05T12:15:00'),
      },
      {
        id: 'fb-seed-4',
        authorName: 'Дмитрий Орлов',
        email: 'd.orlov@example.com',
        rating: 3,
        message:
          'В целом нормально, но картошка в последний раз была пересолена. Надеюсь, это разовый случай.',
        ownerUsername: null,
        createdAt: new Date('2024-08-22T20:45:00'),
      },
    ];
    for (const row of seed) {
      this.store.set(row.id, row);
    }
  }

  findAll(): FeedbackEntity[] {
    return [...this.store.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  findById(id: string): FeedbackEntity | undefined {
    return this.store.get(id);
  }

  create(
    input: Omit<FeedbackEntity, 'id' | 'createdAt'>,
  ): Promise<FeedbackEntity> {
    const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const row: FeedbackEntity = {
      ...input,
      id,
      createdAt: new Date(),
    };
    this.store.set(id, row);
    return Promise.resolve(row);
  }

  save(entity: FeedbackEntity): Promise<FeedbackEntity> {
    const row: FeedbackEntity = {
      ...entity,
      createdAt: entity.createdAt,
    };
    this.store.set(entity.id, row);
    return Promise.resolve(row);
  }

  deleteById(id: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }
}
