import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { StorageService } from '../storage/storage.service';
import { RestApiTags } from '../common/swagger/rest-api-tags';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags(RestApiTags.menuAdmin)
@ApiCookieAuth('session')
@Controller('api/menu-items/upload')
export class MenuUploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('image')
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Недопустимый тип файла: ${file.mimetype}. Разрешены: ${ALLOWED_MIME.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Загрузить изображение позиции меню в S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'URL загруженного изображения',
    schema: { type: 'object', properties: { url: { type: 'string' } } },
  })
  @ApiUnauthorizedResponse({ description: 'Нет прав администратора' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const key = `menu-items/${randomUUID()}${ext}`;

    const url = await this.storageService.upload(key, file.buffer, file.mimetype);
    return { url };
  }
}
