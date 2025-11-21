import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvType } from '@app/shared/config/config.schema';
import { SeederService } from './database.seeder';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService<EnvType>) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../../**/*.entity.{js,ts}'],

        // TODO: Quitar en prod, usar migraciones en lugar de synchronize
        synchronize: true,

        // Seeder
        seeds: ['src/app/shared/database/seeders/*.js'],
      }),
    }),
  ],
  providers: [SeederService],
})
export class DatabaseModule {}
