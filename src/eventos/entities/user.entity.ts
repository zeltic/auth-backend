import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // El email debe ser único
  email: string;

  @Column()
  password: string;

  @Column()
  role: string; // ej: 'accionista', 'administrador'

  @Column({ type: 'int', default: 0 })
  acciones: number; // Cantidad de acciones propias
}
