import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Materia } from './materia.entity';
import { Alternativa } from './alternativa.entity';

@Entity()
export class Votacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  usuario: User;

  @ManyToOne(() => Materia)
  materia: Materia;

  @ManyToOne(() => Alternativa)
  alternativa: Alternativa;

  @Column()
  accionesAsignadas: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaVoto: Date;
}
