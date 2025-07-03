import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Evento } from './entities/evento.entity';
import { Materia } from './entities/materia.entity';
import { Votacion } from './entities/votacion.entity';
import { VotarDto } from './dto/votar.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    @InjectRepository(Votacion)
    private readonly votacionRepository: Repository<Votacion>,
    private readonly dataSource: DataSource,
  ) {}

  async getEventoActivo() {
    const evento = await this.eventoRepository.findOne({
      where: { activo: true },
    });
    if (!evento) {
      throw new NotFoundException('No hay eventos activos.');
    }
    return evento;
  }

  async getMateriasPorEvento(eventoId: number, usuarioId: number) {
    // 1. Obtenemos las materias y sus alternativas
    const materias = await this.materiaRepository.find({
      where: { evento: { codEve: eventoId } },
      relations: ['alternativas'],
    });

    // 2. Para cada materia, buscamos los votos previos del usuario
    const materiasConVotos = await Promise.all(
      materias.map(async (materia) => {
        const votosPrevios = await this.votacionRepository.find({
          where: {
            materia: { codMat: materia.codMat },
            usuario: { id: usuarioId },
          },
          relations: ['alternativa'],
        });

        // Añadimos los votos al objeto de la materia
        return { ...materia, votosPrevios };
      }),
    );

    return materiasConVotos;
  }

  async registrarVoto(usuario: User, votarDto: VotarDto) {
    const materia = await this.materiaRepository.findOneBy({
      codMat: votarDto.materiaId,
    });
    if (!materia) {
      throw new NotFoundException(
        `Materia con ID ${votarDto.materiaId} no encontrada.`,
      );
    }

    const totalVotosEmitidos = votarDto.votos.reduce(
      (sum, v) => sum + v.cantidadAcciones,
      0,
    );
    if (totalVotosEmitidos > usuario.acciones) {
      throw new BadRequestException(
        'Está intentando votar con más acciones de las que posee.',
      );
    }

    // Usamos una transacción para asegurar que todos los votos se guarden o ninguno.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Eliminar votos previos del usuario para esta materia, para permitir re-votar.
      await queryRunner.manager.delete(Votacion, {
        usuario: { id: usuario.id },
        materia: { codMat: votarDto.materiaId },
      });

      for (const voto of votarDto.votos) {
        if (voto.cantidadAcciones > 0) {
          // Solo guardar si hay acciones asignadas
          const nuevaVotacion = this.votacionRepository.create({
            usuario: { id: usuario.id },
            materia: { codMat: votarDto.materiaId },
            alternativa: { codAlt: voto.alternativaId },
            accionesAsignadas: voto.cantidadAcciones,
          });
          await queryRunner.manager.save(nuevaVotacion);
        }
      }

      await queryRunner.commitTransaction();
      return { message: 'Voto registrado exitosamente' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'No se pudo registrar el voto.',
        err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getResultados(materiaId: number) {
    const resultados = await this.votacionRepository
      .createQueryBuilder('votacion')
      // CAMBIO: Seleccionamos el ID de la entidad relacionada 'alternativa.codAlt'
      .select('alternativa.codAlt', 'alternativaId')
      .addSelect('alternativa.nombre', 'alternativaNombre')
      .addSelect('SUM(votacion.accionesAsignadas)', 'totalVotos')
      .innerJoin('votacion.alternativa', 'alternativa')
      // CAMBIO: Filtramos por la relación 'votacion.materia' en lugar de 'votacion.materiaId'
      .where('votacion.materia = :materiaId', { materiaId })
      // CAMBIO: Agrupamos por los campos seleccionados
      .groupBy('alternativa.codAlt, alternativa.nombre')
      .getRawMany();

    return resultados.map((r) => ({
      ...r,
      totalVotos: parseInt(r.totalVotos, 10), // Asegurarse que es un número
    }));
  }
}
