import { Controller, Request, NotFoundException, ForbiddenException, UseGuards } from "@nestjs/common";
import { AgendaService } from "./agenda.service";
import { CreateEventDto } from "./dto/createEvent.dto";
import { UpdateEventDto } from "./dto/updateEvent.dto";
import { Agenda } from "./agenda.entity";
import { Body, Post, Put, Get, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { PermissionsGuard } from "src/guards/permissions.guard";

@Controller('agenda')
export class AgendaController{
    constructor(
        private readonly agendaService: AgendaService
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createEvent(@Body() createEventDto: CreateEventDto): Promise<Agenda>{
        return await this.agendaService.createEvent(createEventDto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Get('all')
    async getAllEvents(): Promise<Agenda[]>{
        return await this.agendaService.getAllEvents();
    }

    @Get('my_events')
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuthGuard('jwt'))
    async getMyEvents(@Request() req: any): Promise<Agenda[]>{
        const userId = req.user.id;
        const myEvents = await this.agendaService.findEventById(userId);
        return myEvents;
    }

    @Get('cliente-agenda')
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuthGuard('jwt'))
    async getClienteAgenda(@Request() req: any): Promise<Agenda[]>{
        const cliente = req.user.equipe.entidade.nome;  
        const agendamentos = await this.agendaService.agendaPorEntidade(cliente);
        return agendamentos;
    }

}