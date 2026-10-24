import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { MenuItemResponseDto } from './menu-item-response.dto';

export class PaginatedMenuItemsDto {
  @ApiProperty({ type: [MenuItemResponseDto] })
  data!: MenuItemResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
