import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CartModule } from '@modules/cart/cart.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { ProductsModule } from '@modules/products/products.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { UsersModule } from '@modules/users/users.module';
import { UploadModule } from '@modules/upload/upload.module';
import { PrismaModule } from '@shared/infrastructure/database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    // Solo sirve archivos estáticos locales en desarrollo (producción usa Cloudinary)
    ...(process.env.NODE_ENV !== 'production' ? [
      ServeStaticModule.forRoot({
        rootPath: join(process.cwd(), 'public'),
        serveRoot: '/',
        exclude: ['/api/(.*)'],
      }),
    ] : []),
    PrismaModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ReportsModule,
    UploadModule,
  ],
})
export class AppModule {}
