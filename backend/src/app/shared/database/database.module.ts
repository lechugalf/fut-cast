import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IConfigService } from '@shared/config/config.schema';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: IConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../../**/*.entity.{js,ts}'],

        // ¡CLAVE! Sincroniza automáticamente tu esquema de BD.
        // Genial para desarrollo/prueba, NUNCA para producción.
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
