import {
  Controller,
  Get,
  Header,
  Param,
  ParseEnumPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationQueryDto,
  resolvedPageLimit,
} from '../common/dto/pagination-query.dto';
import { setPaginationLinkHeader } from '../common/pagination/link-header';
import { totalPages } from '../common/pagination/paginate';
import { MenuCategory } from './dto/menu-category.enum';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { PaginatedMenuItemsDto } from './dto/paginated-menu-items.dto';
import { RestApiTags } from '../common/swagger/rest-api-tags';
import { MenuService } from './menu.service';

@ApiTags(RestApiTags.menuCatalog)
@Controller('api/menu/categories/:category/items')
export class MenuPublicCategoriesApiController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Доступные позиции категории (постранично)' })
  @ApiParam({ name: 'category', enum: MenuCategory })
  @ApiOkResponse({ type: PaginatedMenuItemsDto })
  @ApiBadRequestResponse({
    description: 'Некорректная категория или пагинация',
  })
  listAvailableInCategory(
    @Param('category', new ParseEnumPipe(MenuCategory)) category: MenuCategory,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginationQueryDto,
  ): PaginatedMenuItemsDto {
    const { page, limit } = resolvedPageLimit(query);
    const { data, total } = this.menuService.findAvailableByCategoryPaginated(
      category,
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

  @Get(':itemId')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({
    summary: 'Одна доступная позиция в категории',
    description:
      '404, если позиция в другой категории, недоступна или не существует.',
  })
  @ApiParam({ name: 'category', enum: MenuCategory })
  @ApiOkResponse({ type: MenuItemResponseDto })
  @ApiNotFoundResponse({ description: 'Не найдена в категории или недоступна' })
  getOneAvailableInCategory(
    @Param('category', new ParseEnumPipe(MenuCategory)) category: MenuCategory,
    @Param('itemId') itemId: string,
  ): MenuItemResponseDto {
    return this.menuService.toDto(this.menuService.findOnePublicInCategory(category, itemId));
  }
}
