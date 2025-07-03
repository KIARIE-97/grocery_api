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
import { APP_GUARD } from '@nestjs/core';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard, // Use AuthModule to provide global authentication guard
    },
  ],
})
export class AppModule {}
