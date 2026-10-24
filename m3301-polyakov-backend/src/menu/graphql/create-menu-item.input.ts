import { Field, Float, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MenuCategory } from './menu-category.enum';

@InputType({ description: 'Данные для создания новой позиции меню' })
export class CreateMenuItemInput {
  @IsString()
  @Field({ description: 'Название позиции меню (до 120 символов)' })
  name: string;

  @IsString()
  @Field({ description: 'Описание позиции меню (до 500 символов)' })
  description: string;

  @IsNumber()
  @Min(0)
  @Field(() => Float, { description: 'Цена в рублях (целое число, >= 0)' })
  priceRub: number;

  @IsEnum(MenuCategory)
  @Field(() => MenuCategory, { description: 'Категория позиции меню' })
  category: MenuCategory;

  @IsOptional()
  @IsString()
  @Field({ nullable: true, description: 'Ключ изображения (имя файла), необязательно' })
  imageKey?: string;

  @IsBoolean()
  @Field({ defaultValue: true, description: 'Доступна ли позиция для заказа (по умолчанию true)' })
  isAvailable: boolean;
}
