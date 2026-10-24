import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationQueryDto,
  resolvedPageLimit,
} from '../common/dto/pagination-query.dto';
import { setPaginationLinkHeader } from '../common/pagination/link-header';
import { totalPages } from '../common/pagination/paginate';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { PaginatedMenuItemsDto } from './dto/paginated-menu-items.dto';
import { RestApiTags } from '../common/swagger/rest-api-tags';
import { MenuService } from './menu.service';

@ApiTags(RestApiTags.menuCatalog)
@Controller('api/menu')
export class MenuPublicApiController {
  constructor(private readonly menuService: MenuService) {}

  @Get('items')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public-menu-items')
  @CacheTTL(5000)
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({
    summary: 'Публичный каталог позиций (постранично)',
    description:
      'Соответствует данным на странице «Меню» для гостя: только доступные позиции.',
  })
  @ApiOkResponse({ type: PaginatedMenuItemsDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  listAvailable(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginationQueryDto,
  ): PaginatedMenuItemsDto {
    const { page, limit } = resolvedPageLimit(query);
    const { data, total } = this.menuService.findAvailablePaginated(
      page,
      limit,
    );
    setPaginationLinkHeader(req, res, page, limit, total);
    return {
      data: data.map((e) => this.menuService.toDto(e)),
      meta: {
        page,
        limit,
        total,
        totalPages: totalPages(total, limit),
      },
    };
  }

  @Get('items/:id')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({
    summary: 'Одна доступная позиция по id',
    description: '404, если позиции нет или isAvailable=false.',
  })
  @ApiOkResponse({ type: MenuItemResponseDto })
  @ApiNotFoundResponse({ description: 'Не найдена или недоступна' })
  getOneAvailable(@Param('id') id: string): MenuItemResponseDto {
    return this.menuService.toDto(this.menuService.findOnePublicAvailable(id));
  }
}
