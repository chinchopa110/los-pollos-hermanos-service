import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MenuCategory } from './menu-category.enum';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Новая позиция', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Вкусное описание', minLength: 1, maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 399, minimum: 0 })
  @IsInt()
  @Min(0)
  priceRub!: number;

  @ApiProperty({ enum: MenuCategory })
  @IsEnum(MenuCategory)
  category!: MenuCategory;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Ключ изображения или null',
  })
  @IsOptional()
  @IsString()
  imageKey?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
