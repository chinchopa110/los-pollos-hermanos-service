import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType({ description: 'Данные для обновления отзыва (все поля необязательны)' })
export class UpdateFeedbackInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true, description: 'Новое имя автора (2–50 символов)' })
  authorName?: string;

  @IsOptional()
  @IsEmail()
  @Field({ nullable: true, description: 'Новый email автора' })
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Field(() => Int, { nullable: true, description: 'Новая оценка от 1 до 5' })
  rating?: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true, description: 'Новый текст отзыва (5–500 символов)' })
  message?: string;
}
