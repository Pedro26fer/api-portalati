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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post('create/:id')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'The event has been successfully created.', type: Agenda })
  @ApiResponse({ status: 406, description: 'Not Acceptable.' })
  @UseGuards(JwtAuthGuard, AuthGuard('jwt'))
  async createEvent(@Param('id') id: string, @Request() req: any, @Body() createEventDto: CreateEventDto): Promise<Agenda> {
    const userLogado = req.user
    return await this.agendaService.createEvent(userLogado, createEventDto, id);
  }

  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'List of all events.', type: [Agenda] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('all')
  async getAllEvents(): Promise<Agenda[]> {
    return await this.agendaService.getAllEvents();
  }

  @ApiOperation({ summary: 'Get events by entidade' })
  @ApiResponse({ status: 200, description: 'List of events for the entidade.', type: [Agenda] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @UseGuards(JwtAuthGuard, AuthGuard('jwt'))
  @Get('agenda_por_entidade')
  async getEventByEntidade(@Request() req: any): Promise<Agenda[]>{
    const userId = req.user.id 
    return await this.agendaService.agendaPorEntidade(userId)
  }

  @ApiOperation({ summary: 'Get my events' })
  @ApiResponse({ status: 200, description: 'List of my events.', type: [Agenda] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 406, description: 'Not Acceptable.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('my_events')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  async getMyEvents(@Request() req: any): Promise<Agenda[]> {
    const userId = req.user.id;
    const myEvents = await this.agendaService.findEventsByUserId(userId);
    return myEvents;
  }

  @ApiOperation({ summary: 'Get my scheduled appointments' })
  @ApiResponse({ status: 200, description: 'List of my scheduled appointments.', type: [Agenda] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('agendamentos_marcados')
  @UseGuards(JwtAuthGuard)
  async meus_agendamentos(@Request() req: any): Promise<Agenda[]>{
    const userId = req.user.id 
    return this.agendaService.getEventByResponsavelPelaAbertura(userId)
  }

  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'The event details.', type: Agenda })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('agendamento/:id')
  @UseGuards(JwtAuthGuard)
  async getEventById(@Param('id') id: string) : Promise<Agenda>{
    return this.agendaService.getEventById(id)
  }

  @ApiOperation({ summary: 'Get events by tecnico campo' })
  @ApiResponse({ status: 200, description: 'List of events for the tecnico campo.', type: [Agenda] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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

  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Delete('remove/:id')
  @UseGuards(JwtAuthGuard, AuthGuard('jwt'), PermissionsGuard)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return await this.agendaService.deleteEvent(id);
  }

  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully updated.', type: Agenda })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
