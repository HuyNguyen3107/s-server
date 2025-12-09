import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { UploadModule } from './upload/upload.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ShippingFeesModule } from './shipping-fees/shipping-fees.module';
import { CollectionsModule } from './collections/collections.module';
import { ProductsModule } from './products/products.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { ProductCustomsModule } from './product-customs/product-customs.module';
import { InventoryModule } from './inventory/inventory.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { UserPermissionsModule } from './user-permissions/user-permissions.module';
import { BackgroundsModule } from './backgrounds/backgrounds.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { InformationsModule } from './informations/informations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    FeedbacksModule,
    UploadModule,
    PromotionsModule,
    ShippingFeesModule,
    CollectionsModule,
    ProductsModule,
    ProductCategoriesModule,
    ProductVariantsModule,
    ProductCustomsModule,
    InventoryModule,
    PermissionsModule,
    RolesModule,
    RolePermissionsModule,
    UserRolesModule,
    UserPermissionsModule,
    BackgroundsModule,
    OrdersModule,
    NotificationsModule,
    ConsultationsModule,
    InformationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
