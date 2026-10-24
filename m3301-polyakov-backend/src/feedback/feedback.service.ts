import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackRepository } from '../database/repositories/feedback.repository';
import type { FeedbackEntity } from '../database/entities/feedback.entity';
import { paginateSlice } from '../common/pagination/paginate';

const NAME_RE = /^[A-Za-zА-Яа-яЁё\s\-']{2,50}$/;

@Injectable()
export class FeedbackService {
  constructor(private readonly feedback: FeedbackRepository) {}

  findAll(): FeedbackEntity[] {
    return this.feedback.findAll();
  }

  findAllPaginated(page: number, limit: number) {
    const all = this.findAll();
    return paginateSlice(all, page, limit);
  }

  findOne(id: string): FeedbackEntity {
    const row = this.feedback.findById(id);
    if (!row) {
      throw new NotFoundException(`Отзыв ${id} не найден`);
    }
    return row;
  }

  parseRating(raw: string | number): number {
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      throw new BadRequestException('Оценка от 1 до 5');
    }
    return n;
  }

  validateAuthorName(name: string): string {
    const t = name.trim();
    if (!NAME_RE.test(t)) {
      throw new BadRequestException(
        'Имя: 2–50 символов, буквы, пробел, дефис, апостроф',
      );
    }
    return t;
  }

  validateEmail(email: string): string {
    const t = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      throw new BadRequestException('Некорректный email');
    }
    return t;
  }

  validateMessage(message: string): string {
    const t = message.trim();
    if (t.length < 5 || t.length > 500) {
      throw new BadRequestException('Комментарий от 5 до 500 символов');
    }
    return t;
  }

  async create(input: {
    authorName: string;
    email: string;
    rating: number;
    message: string;
    ownerUsername: string | null;
  }): Promise<FeedbackEntity> {
    return this.feedback.create({
      authorName: this.validateAuthorName(input.authorName),
      email: this.validateEmail(input.email),
      rating: this.parseRating(input.rating),
      message: this.validateMessage(input.message),
      ownerUsername: input.ownerUsername,
    });
  }

  async update(
    id: string,
    input: {
      authorName: string;
      email: string;
      rating: number;
      message: string;
    },
  ): Promise<FeedbackEntity> {
    const existing = this.findOne(id);
    const next: FeedbackEntity = {
      ...existing,
      ownerUsername: existing.ownerUsername,
      authorName: this.validateAuthorName(input.authorName),
      email: this.validateEmail(input.email),
      rating: this.parseRating(input.rating),
      message: this.validateMessage(input.message),
    };
    return this.feedback.save(next);
  }

  async patch(
    id: string,
    input: Partial<
      Pick<FeedbackEntity, 'authorName' | 'email' | 'rating' | 'message'>
    >,
  ): Promise<FeedbackEntity> {
    const existing = this.findOne(id);
    const authorName =
      input.authorName !== undefined
        ? this.validateAuthorName(input.authorName)
        : existing.authorName;
    const email =
      input.email !== undefined
        ? this.validateEmail(input.email)
        : existing.email;
    const rating =
      input.rating !== undefined
        ? this.parseRating(input.rating)
        : existing.rating;
    const message =
      input.message !== undefined
        ? this.validateMessage(input.message)
        : existing.message;
    const next: FeedbackEntity = {
      ...existing,
      authorName,
      email,
      rating,
      message,
    };
    return this.feedback.save(next);
  }

  async remove(id: string): Promise<void> {
    this.findOne(id);
    await this.feedback.deleteById(id);
  }

  ratingOptions(selected?: number) {
    const labels: Record<number, string> = {
      5: '5 — Отлично',
      4: '4 — Хорошо',
      3: '3 — Нормально',
      2: '2 — Так себе',
      1: '1 — Плохо',
    };
    return [5, 4, 3, 2, 1].map((value) => ({
      value,
      label: labels[value],
      selected: selected === value,
    }));
  }
}
