import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min, IsOptional } from 'class-validator';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Номер страницы (с 1)',
    default: DEFAULT_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Размер страницы',
    default: DEFAULT_LIMIT,
    minimum: 1,
    maximum: MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number;
}

export function resolvedPageLimit(q: PaginationQueryDto): {
  page: number;
  limit: number;
} {
  return {
    page: q.page ?? DEFAULT_PAGE,
    limit: q.limit ?? DEFAULT_LIMIT,
  };
}
