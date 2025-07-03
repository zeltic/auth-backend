import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Materia } from './materia.entity';

@Entity()
export class Evento {
  @PrimaryGeneratedColumn()
  codEve: number;

  @Column()
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column()
  lugar: string;

  @Column({ comment: '1: Presencial, 2: Híbrido, 3: Virtual' })
  modoEvento: number;

  @OneToMany(() => Materia, (materia) => materia.evento)
  materias: Materia[];
}
