import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuCategory } from './menu-category.enum';
import type { MenuItemEntity } from '../../database/entities/menu-item.entity';

export class MenuItemResponseDto {
  @ApiProperty({ example: 'mi-123' })
  id!: string;

  @ApiProperty({ example: 'Баскет острый' })
  name!: string;

  @ApiProperty({ example: 'Описание позиции' })
  description!: string;

  @ApiProperty({ example: 499, description: 'Цена в рублях (целое число)' })
  priceRub!: number;

  @ApiProperty({ enum: MenuCategory })
  category!: MenuItemEntity['category'];

  @ApiPropertyOptional({
    nullable: true,
    description: 'Ключ файла изображения',
  })
  imageKey!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Публичный URL изображения в Yandex Object Storage',
    example: 'https://storage.yandexcloud.net/web-polyakov/chicken1.jpg',
  })
  imageUrl!: string | null;

  @ApiProperty({ description: 'Доступна ли позиция к заказу' })
  isAvailable!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
