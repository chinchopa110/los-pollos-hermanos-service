import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'Иван Иванов', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Za-zА-Яа-яЁё\s\-']+$/, {
    message:
      'Имя: только буквы, пробел, дефис, апостроф (2–50 символов после проверки длины)',
  })
  authorName!: string;

  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    example: 'Всё понравилось, обязательно вернусь.',
    minLength: 5,
    maxLength: 500,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  message!: string;
}
