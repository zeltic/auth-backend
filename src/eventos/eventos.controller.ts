import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { EventosService } from './eventos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VotarDto } from './dto/votar.dto';
import { UsersService } from '../users/users.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface'; // <-- Importar

@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly usersService: UsersService,
  ) {}

  @Get('activo')
  async getEventoActivo() {
    return this.eventosService.getEventoActivo();
  }

  @Get(':id/materias')
  async getMateriasPorEvento(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser, // <-- Tipar el request
  ) {
    const materias = await this.eventosService.getMateriasPorEvento(id);
    const usuario = await this.usersService.findOne(req.user.userId); // <-- Acceso seguro
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${req.user.userId} no encontrado.`,
      );
    }
    return {
      materias,
      usuarioAcciones: usuario.acciones,
    };
  }

  @Post('votar')
  async registrarVoto(
    @Request() req: RequestWithUser,
    @Body() votarDto: VotarDto,
  ) {
    // <-- Tipar el request
    const usuario = await this.usersService.findOne(req.user.userId); // <-- Acceso seguro
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${req.user.userId} no encontrado.`,
      );
    }
    return this.eventosService.registrarVoto(usuario, votarDto);
  }

  @Get('materias/:materiaId/resultados')
  getResultados(@Param('materiaId', ParseIntPipe) materiaId: number) {
    return this.eventosService.getResultados(materiaId);
  }
}
