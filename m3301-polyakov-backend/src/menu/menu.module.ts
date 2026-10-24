import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseReferenceModule } from '../database/database-reference.module';
import { StorageModule } from '../storage/storage.module';
import { MenuController } from './menu.controller';
import { MenuItemsController } from './menu-items.controller';
import { MenuApiController } from './menu-api.controller';
import { MenuCategoriesApiController } from './menu-categories-api.controller';
import { MenuPublicApiController } from './menu-public-api.controller';
import { MenuPublicCategoriesApiController } from './menu-public-categories-api.controller';
import { MenuUploadController } from './menu-upload.controller';
import { MenuService } from './menu.service';
import { MenuEventsService } from './menu-events.service';
import { AdminMenuMiddleware } from './admin-menu.middleware';
import { MenuResolver } from './menu.resolver';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [DatabaseReferenceModule, StorageModule, AuditModule],
  controllers: [
    MenuController,
    MenuItemsController,
    MenuApiController,
    MenuCategoriesApiController,
    MenuPublicApiController,
    MenuPublicCategoriesApiController,
    MenuUploadController,
  ],
  providers: [MenuService, MenuEventsService, MenuResolver],
  exports: [MenuService],
})
export class MenuModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminMenuMiddleware)
      .forRoutes(
        MenuItemsController,
        MenuApiController,
        MenuCategoriesApiController,
        MenuUploadController,
      );
  }
}
