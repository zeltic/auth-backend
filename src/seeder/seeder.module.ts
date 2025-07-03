import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User } from '../users/entities/user.entity';
import { Evento } from '../eventos/entities/evento.entity';
import { Materia } from '../eventos/entities/materia.entity';
import { Alternativa } from '../eventos/entities/alternativa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Evento, Materia, Alternativa])],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
