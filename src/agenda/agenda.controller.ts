import {
  Controller,
  Request,
  NotFoundException,
  ForbiddenException,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateEventDto } from './dto/createEvent.dto';
import { UpdateEventDto } from './dto/updateEvent.dto';
import { Agenda } from './agenda.entity';
import { Body, Post, Put, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/guards/permissions.guard';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<Agenda> {
    return await this.agendaService.createEvent(createEventDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('all')
  async getAllEvents(): Promise<Agenda[]> {
    return await this.agendaService.getAllEvents();
  }

  @Get('my_events')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  async getMyEvents(@Request() req: any): Promise<Agenda[]> {
    const userId = req.user.id;
    const myEvents = await this.agendaService.findEventsByUserId(userId);
    return myEvents;
  }

  @Get('tecnico_campo')
  @UseGuards(JwtAuthGuard, AuthGuard('jwt'))
  async getByTecnicoCampo(
    @Request() req: any,
    @Body('tecnicoCampo') tecnicoCampo: string,
  ): Promise<Agenda[]> {
    const entidadeDoUsuario = req.user.equipe.entidade.nome;
    const events = await this.agendaService.getEventesByTecnicoCampo(
      tecnicoCampo,
      entidadeDoUsuario,
    );
    return events;
  }

  @Get('cliente-agenda')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  async getClienteAgenda(@Request() req: any): Promise<Agenda[]> {
    const cliente = req.user.equipe.entidade.nome;
    const agendamentos = await this.agendaService.agendaPorEntidade(cliente);
    return agendamentos;
  }

  @Delete('remove/:id')
  @UseGuards(JwtAuthGuard, AuthGuard('jwt'), PermissionsGuard)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return await this.agendaService.deleteEvent(id);
  }

  @UseGuards(JwtAuthGuard, AuthGuard('jwt'))
  @Patch('edit/:id')
  async updateAgendamento(
    @Request() req: any,
    @Body() updateEvendoDto: UpdateEventDto,
    @Param('id') id: string,
  ): Promise<Agenda> {
    const user = req.user;
    return await this.agendaService.updateEvent(user, id, updateEvendoDto);
  }
}
