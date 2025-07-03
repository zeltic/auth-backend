import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Evento } from './evento.entity';
import { Alternativa } from './alternativa.entity';

@Entity()
export class Materia {
  @PrimaryGeneratedColumn()
  codMat: number;

  @Column()
  descripcion: string;

  @Column({
    comment:
      'Define si un accionista puede distribuir sus votos en varias alternativas',
  })
  distribuirVotos: boolean;

  @ManyToOne(() => Evento, (evento) => evento.materias)
  evento: Evento;

  @OneToMany(() => Alternativa, (alternativa) => alternativa.materia)
  alternativas: Alternativa[];
}
