import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Evento } from '../eventos/entities/evento.entity';
import { Materia } from '../eventos/entities/materia.entity';
import { Alternativa } from '../eventos/entities/alternativa.entity';
import { Votacion } from '../eventos/entities/votacion.entity';

@Injectable()
export class SeederService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    @InjectRepository(Alternativa)
    private readonly alternativaRepository: Repository<Alternativa>,
    @InjectRepository(Votacion)
    private readonly votacionRepository: Repository<Votacion>,
  ) {}

  async seed() {
    // 1. LIMPIAR LA BASE DE DATOS COMPLETAMENTE
    await this.dataSource.query(
      'TRUNCATE TABLE "user", "evento", "materia", "alternativa", "votacion" RESTART IDENTITY CASCADE;',
    );
    console.log('Database cleaned.');

    // 2. CREAR USUARIOS CON DIFERENTES ROLES Y ACCIONES
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [user1, user2, user3, adminUser] = await this.userRepository.save([
      {
        email: 'accionista1@test.com',
        password: hashedPassword,
        role: 'accionista',
        acciones: 15000,
      },
      {
        email: 'accionista2@test.com',
        password: hashedPassword,
        role: 'accionista',
        acciones: 30000,
      },
      {
        email: 'accionista3@test.com',
        password: hashedPassword,
        role: 'accionista',
        acciones: 50000,
      },
      {
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'administrador',
        acciones: 0,
      },
    ]);
    console.log('Users created.');

    // 3. CREAR EVENTOS (ACTIVO E INACTIVO)
    const [eventoActivo] = await this.eventoRepository.save([
      {
        nombre: 'Junta Ordinaria de Accionistas 2024',
        activo: true,
        lugar: 'Oficinas Centrales y Remoto',
        modoEvento: 2,
      },
      {
        nombre: 'Junta Extraordinaria 2023',
        activo: false,
        lugar: 'Oficinas Centrales',
        modoEvento: 1,
      },
    ]);
    console.log('Events created.');

    // 4. CREAR MATERIAS PARA EL EVENTO ACTIVO
    const [materiaDirectorio, materiaMemoria, materiaNueva] =
      await this.materiaRepository.save([
        {
          descripcion: 'Elección de Directorio',
          distribuirVotos: true,
          evento: eventoActivo,
        },
        {
          descripcion: 'Aprobación de Memoria Anual',
          distribuirVotos: false,
          evento: eventoActivo,
        },
        {
          descripcion: 'Nueva Propuesta de Inversión',
          distribuirVotos: false,
          evento: eventoActivo,
        },
      ]);
    console.log('Matters created.');

    // 5. CREAR ALTERNATIVAS PARA CADA MATERIA
    const [candidatoA, candidatoB, candidatoC] =
      await this.alternativaRepository.save([
        { nombre: 'Candidato A: Juan Pérez', materia: materiaDirectorio },
        { nombre: 'Candidato B: María González', materia: materiaDirectorio },
        { nombre: 'Candidato C: Pedro Jiménez', materia: materiaDirectorio },
      ]);
    const [aprueboMemoria, rechazoMemoria] =
      await this.alternativaRepository.save([
        { nombre: 'Apruebo', materia: materiaMemoria },
        { nombre: 'Rechazo', materia: materiaMemoria },
        { nombre: 'Abstengo', materia: materiaMemoria },
      ]);
    await this.alternativaRepository.save([
      { nombre: 'Aceptar Propuesta', materia: materiaNueva },
      { nombre: 'Rechazar Propuesta', materia: materiaNueva },
    ]);
    console.log('Alternatives created.');

    // 6. PRE-POBLAR VOTOS PARA ALGUNAS MATERIAS
    await this.votacionRepository.save([
      // Votos para Elección de Directorio (distribuidos)
      {
        usuario: user1,
        materia: materiaDirectorio,
        alternativa: candidatoA,
        accionesAsignadas: 10000,
      },
      {
        usuario: user1,
        materia: materiaDirectorio,
        alternativa: candidatoB,
        accionesAsignadas: 5000,
      },
      {
        usuario: user2,
        materia: materiaDirectorio,
        alternativa: candidatoB,
        accionesAsignadas: 20000,
      },
      {
        usuario: user2,
        materia: materiaDirectorio,
        alternativa: candidatoC,
        accionesAsignadas: 10000,
      },
      // Votos para Aprobación de Memoria (no distribuidos)
      {
        usuario: user1,
        materia: materiaMemoria,
        alternativa: aprueboMemoria,
        accionesAsignadas: 15000,
      },
      {
        usuario: user2,
        materia: materiaMemoria,
        alternativa: rechazoMemoria,
        accionesAsignadas: 30000,
      },
      {
        usuario: user3,
        materia: materiaMemoria,
        alternativa: aprueboMemoria,
        accionesAsignadas: 50000,
      },
    ]);
    console.log('Votes pre-populated.');

    return {
      message: 'Base de datos reseteada y poblada con datos de demostración.',
    };
  }
}
