import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { FeedbackResponseDto } from './feedback-response.dto';

export class PaginatedFeedbackDto {
  @ApiProperty({ type: [FeedbackResponseDto] })
  data!: FeedbackResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
