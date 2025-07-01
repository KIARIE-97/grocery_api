import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('PG_HOST'),
        port: configService.getOrThrow<number>('PG_PORT'),
        username: configService.getOrThrow<string>('PG_USERNAME'),
        password: configService.getOrThrow<string>('PG_PASSWORD'),
        database: configService.getOrThrow<string>('PG_DATABASE'),
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: configService.getOrThrow<boolean>('PG_SYNC', true),
        logging: configService.getOrThrow<boolean>('PG_LOGGING', false),
        migrations: [__dirname + '/../migrations//*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
