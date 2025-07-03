import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Materia } from './materia.entity';

@Entity()
export class Alternativa {
  @PrimaryGeneratedColumn()
  codAlt: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Materia, (materia) => materia.alternativas)
  materia: Materia;
}
