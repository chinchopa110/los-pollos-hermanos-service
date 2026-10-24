import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackResponseDto {
  @ApiProperty({ example: 'fb-1' })
  id!: string;

  @ApiProperty({ example: 'Иван Иванов' })
  authorName!: string;

  @ApiProperty({ example: 'ivan@example.com' })
  email!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating!: number;

  @ApiProperty({ example: 'Отличная курица!' })
  message!: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Логин владельца отзыва, если оставлен авторизованным пользователем',
  })
  ownerUsername!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
