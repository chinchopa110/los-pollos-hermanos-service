import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator';

@InputType({ description: 'Данные для создания нового отзыва' })
export class CreateFeedbackInput {
  @IsString()
  @Field({ description: 'Имя автора (2–50 символов, буквы, пробел, дефис, апостроф)' })
  authorName: string;

  @IsEmail()
  @Field({ description: 'Email автора отзыва' })
  email: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Field(() => Int, { description: 'Оценка от 1 до 5' })
  rating: number;

  @IsString()
  @Field({ description: 'Текст отзыва (5–500 символов)' })
  message: string;
}
