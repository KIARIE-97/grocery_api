import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { StoresModule } from './stores/stores.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './auth/guards/at.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentModule } from './payment/payment.module';
import { GeminiModule } from './gemini/gemini.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true, // Makes cache available globally
      useFactory: (configService: ConfigService) => ({
        ttl: configService.getOrThrow<number>('T_TTL'),
        stores: [createKeyv(configService.getOrThrow<string>('REDIS_URL'))],
      }),
    }),
    DatabaseModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get<string>('GMAIL_USER'),
            pass: configService.get<string>('GMAIL_PASS'),
          },
        },

        defaults: {
          from: '"No Reply" sarahwanjiruki1@gmail.com', // Default sender address
        },
        template: {
          // Path to your template files
          dir: join(__dirname, '..', 'templates'), // folder with your .hbs files
          adapter: new HandlebarsAdapter(), // or PugAdapter, EjsAdapter
          options: {
            strict: true,
          },
        },
      }),
    }),
    UsersModule,
    OrdersModule,
    StoresModule,
    DriversModule,
    AuthModule,
    ProductsModule,
    CategoryModule,
    MailerModule,
    CloudinaryModule,
    PaymentModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard, // Use AuthModule to provide global authentication guard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // Global cache interceptor
    },
  ],
})
export class AppModule {}
