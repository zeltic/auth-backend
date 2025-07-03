import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Evento } from '../eventos/entities/evento.entity';
import { Materia } from '../eventos/entities/materia.entity';
import { Alternativa } from '../eventos/entities/alternativa.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    @InjectRepository(Alternativa)
    private readonly alternativaRepository: Repository<Alternativa>,
  ) {}

  async seed() {
    // 1. Crear usuarios
    const user1Exists = await this.userRepository.findOneBy({
      email: 'accionista1@test.com',
    });
    if (!user1Exists) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await this.userRepository.save({
        email: 'accionista1@test.com',
        password: hashedPassword,
        role: 'accionista',
        acciones: 15000,
      });
    }

    const user2Exists = await this.userRepository.findOneBy({
      email: 'accionista2@test.com',
    });
    if (!user2Exists) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await this.userRepository.save({
        email: 'accionista2@test.com',
        password: hashedPassword,
        role: 'accionista',
        acciones: 30000,
      });
    }

    // 2. Crear un evento activo
    let eventoActivo = await this.eventoRepository.findOneBy({ activo: true });
    if (!eventoActivo) {
      eventoActivo = await this.eventoRepository.save({
        nombre: 'Junta Ordinaria de Accionistas 2024',
        activo: true,
        lugar: 'Oficinas Centrales y Remoto',
        modoEvento: 2, // Híbrido
      });
    }

    // 3. Crear materias para el evento
    let materia1 = await this.materiaRepository.findOneBy({
      descripcion: 'Elección de Directorio',
    });
    if (!materia1) {
      materia1 = await this.materiaRepository.save({
        descripcion: 'Elección de Directorio',
        distribuirVotos: true,
        evento: eventoActivo,
      });
      // Alternativas para materia 1
      await this.alternativaRepository.save([
        { nombre: 'Candidato A: Juan Pérez', materia: materia1 },
        { nombre: 'Candidato B: María González', materia: materia1 },
        { nombre: 'Candidato C: Pedro Jiménez', materia: materia1 },
        { nombre: 'Abstenerse', materia: materia1 },
      ]);
    }

    let materia2 = await this.materiaRepository.findOneBy({
      descripcion: 'Aprobación de Memoria Anual',
    });
    if (!materia2) {
      materia2 = await this.materiaRepository.save({
        descripcion: 'Aprobación de Memoria Anual',
        distribuirVotos: false,
        evento: eventoActivo,
      });
      // Alternativas para materia 2
      await this.alternativaRepository.save([
        { nombre: 'Apruebo', materia: materia2 },
        { nombre: 'Rechazo', materia: materia2 },
        { nombre: 'Abstengo', materia: materia2 },
      ]);
    }

    return { message: 'Base de datos poblada con datos de prueba.' };
  }
}
