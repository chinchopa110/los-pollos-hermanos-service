import { Field, Float, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MenuCategory } from './menu-category.enum';

@InputType({ description: 'Данные для обновления позиции меню (все поля необязательны)' })
export class UpdateMenuItemInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true, description: 'Новое название позиции меню (до 120 символов)' })
  name?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true, description: 'Новое описание позиции меню (до 500 символов)' })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Field(() => Float, { nullable: true, description: 'Новая цена в рублях (>= 0)' })
  priceRub?: number;

  @IsOptional()
  @IsEnum(MenuCategory)
  @Field(() => MenuCategory, { nullable: true, description: 'Новая категория позиции меню' })
  category?: MenuCategory;

  @IsOptional()
  @IsString()
  @Field({ nullable: true, description: 'Новый ключ изображения (имя файла)' })
  imageKey?: string;
}
