import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { EventosModule } from './eventos/eventos.module';
import { SeederModule } from './seeder/seeder.module';

// Importa todas las nuevas entidades
import { Evento } from './eventos/entities/evento.entity';
import { Materia } from './eventos/entities/materia.entity';
import { Alternativa } from './eventos/entities/alternativa.entity';
import { Votacion } from './eventos/entities/votacion.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [User, Evento, Materia, Alternativa, Votacion], // <-- AÑADE LAS NUEVAS ENTIDADES AQUÍ
        synchronize: true, // Desactiva en producción
      }),
    }),
    AuthModule,
    UsersModule,
    EventosModule, // <-- AÑADE EL NUEVO MÓDULO
    SeederModule, // <-- AÑADE EL MÓDULO DE SEEDING
  ],
})
export class AppModule {}
