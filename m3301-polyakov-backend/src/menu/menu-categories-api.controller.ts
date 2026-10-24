import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
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

@ApiTags(RestApiTags.menuAdmin)
@ApiCookieAuth('session')
@Controller('api/menu-items/categories/:category/items')
export class MenuCategoriesApiController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({
    summary: 'Список позиций в категории (постранично), админ',
    description:
      'Родительский ресурс — категория; дочерние — все позиции категории (включая недоступные). Публичный каталог — `GET /api/menu/categories/{category}/items`.',
  })
  @ApiParam({ name: 'category', enum: MenuCategory })
  @ApiOkResponse({ type: PaginatedMenuItemsDto })
  @ApiBadRequestResponse({
    description: 'Некорректная категория или параметры пагинации',
  })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  listInCategory(
    @Param('category', new ParseEnumPipe(MenuCategory)) category: MenuCategory,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginationQueryDto,
  ): PaginatedMenuItemsDto {
    const { page, limit } = resolvedPageLimit(query);
    const { data, total } = this.menuService.findByCategoryPaginated(
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
  @ApiOperation({
    summary: 'Одна позиция внутри категории',
    description:
      'Возвращает 404, если позиция существует, но принадлежит другой категории.',
  })
  @ApiParam({ name: 'category', enum: MenuCategory })
  @ApiParam({ name: 'itemId', description: 'Идентификатор позиции меню' })
  @ApiOkResponse({ type: MenuItemResponseDto })
  @ApiNotFoundResponse({ description: 'Позиция не найдена в этой категории' })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  getOneInCategory(
    @Param('category', new ParseEnumPipe(MenuCategory)) category: MenuCategory,
    @Param('itemId') itemId: string,
  ): MenuItemResponseDto {
    return this.menuService.toDto(this.menuService.findOneInCategory(category, itemId));
  }
}
