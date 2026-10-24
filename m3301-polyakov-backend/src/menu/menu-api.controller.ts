import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  PaginationQueryDto,
  resolvedPageLimit,
} from '../common/dto/pagination-query.dto';
import { setPaginationLinkHeader } from '../common/pagination/link-header';
import { totalPages } from '../common/pagination/paginate';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { PatchMenuItemDto } from './dto/patch-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { PaginatedMenuItemsDto } from './dto/paginated-menu-items.dto';
import { RestApiTags } from '../common/swagger/rest-api-tags';
import { MenuService } from './menu.service';
import { AuditLog, AuditLogInterceptor } from 'src/common/interceptors/audit-log.interceptor';

@ApiTags(RestApiTags.menuAdmin)
@ApiCookieAuth('session')
@Controller('api/menu-items')
@UseInterceptors(AuditLogInterceptor)
export class MenuApiController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Список позиций меню (постранично)' })
  @ApiOkResponse({
    description: 'Страница списка',
    type: PaginatedMenuItemsDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  @AuditLog({
    actionType: 'LIST',
    entityType: 'menu-item',
  })
  list(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginationQueryDto,
  ): PaginatedMenuItemsDto {
    const { page, limit } = resolvedPageLimit(query);
    const { data, total } = this.menuService.findAllPaginated(page, limit);
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

  @Get(':id')
  @ApiOperation({ summary: 'Одна позиция меню по идентификатору' })
  @ApiOkResponse({ type: MenuItemResponseDto })
  @ApiNotFoundResponse({ description: 'Позиция не найдена' })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  @AuditLog({
    actionType: 'GET',
    entityType: 'menu-item',
    getEntityId: (data) => data?.id || null,
    getMetadata: (data) => ({ name: data?.name }),
  })
  getOne(@Param('id') id: string): MenuItemResponseDto {
    return this.menuService.toDto(this.menuService.findOne(id));
  }

  @Post()
  @ApiOperation({ summary: 'Создать позицию меню' })
  @ApiCreatedResponse({ type: MenuItemResponseDto })
  @ApiBadRequestResponse({ description: 'Ошибка валидации тела запроса' })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  @AuditLog({
    actionType: 'CREATE',
    entityType: 'menu-item',
    getEntityId: (data) => data?.id || null,
    getMetadata: (data) => ({ name: data?.name, category: data?.category }),
  })
  async create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const imageKey =
      dto.imageKey === undefined || dto.imageKey === '' || dto.imageKey === null
        ? null
        : String(dto.imageKey).trim() || null;
    const item = await this.menuService.create({
      name: dto.name,
      description: dto.description,
      priceRub: dto.priceRub,
      category: dto.category,
      imageKey,
      isAvailable: dto.isAvailable ?? true,
    });
    return this.menuService.toDto(item);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить позицию меню' })
  @ApiOkResponse({ type: MenuItemResponseDto })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiNotFoundResponse({ description: 'Позиция не найдена' })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  @AuditLog({
    actionType: 'UPDATE',
    entityType: 'menu-item',
    getEntityId: (data) => data?.id || null,
    getMetadata: (data) => ({ name: data?.name, category: data?.category }),
  })
  async patch(
    @Param('id') id: string,
    @Body() dto: PatchMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const patch: Parameters<MenuService['update']>[1] = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.priceRub !== undefined) patch.priceRub = dto.priceRub;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.imageKey !== undefined) {
      patch.imageKey =
        dto.imageKey === '' || dto.imageKey === null
          ? null
          : String(dto.imageKey).trim() || null;
    }
    if (dto.isAvailable !== undefined) patch.isAvailable = dto.isAvailable;
    return this.menuService.toDto(await this.menuService.update(id, patch));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить позицию меню' })
  @ApiNoContentResponse({ description: 'Удалено' })
  @ApiNotFoundResponse({ description: 'Позиция не найдена' })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  @AuditLog({
    actionType: 'DELETE',
    entityType: 'menu-item',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.menuService.remove(id);
  }
}
