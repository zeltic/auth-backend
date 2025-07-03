import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { Evento } from './entities/evento.entity';
import { Materia } from './entities/materia.entity';
import { Alternativa } from './entities/alternativa.entity';
import { Votacion } from './entities/votacion.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evento, Materia, Alternativa, Votacion]),
    UsersModule, // Importamos UsersModule para poder usar UsersService
  ],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}
