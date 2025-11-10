import { Inject, NotFoundException } from '@nestjs/common';
import {
  Injectable,
  NotAcceptableException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Agenda } from './agenda.entity';
import { CreateEventDto } from './dto/createEvent.dto';
import { UpdateEventDto } from './dto/updateEvent.dto';
import { Usina } from 'src/usina/usina.entity';
import { Equipamentos } from 'src/equipamentos/equipamentos.entity';
import { User } from 'src/user/user.entity';
import { Entidade } from 'src/entidade/entidade.entity';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agenda)
    private readonly agendaRepository: Repository<Agenda>,
    @InjectRepository(Usina)
    private readonly usinaRepository: Repository<Usina>,
    @InjectRepository(Equipamentos)
    private readonly equipamentoRepository: Repository<Equipamentos>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Entidade)
    private readonly entidadeRepository: Repository<Entidade>,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Agenda> {
    const {
      start,
      end,
      tag,
      tecnicoEmail,
      cliente,
      usina,
      status,
      equipamento,
    } = createEventDto;
    const tecnicoUser = await this.userRepository.findOne({
      where: { email: tecnicoEmail },
    });
    if (!tecnicoUser) {
      throw new NotAcceptableException('Técnico não encontrado');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const horárioOcupado = await this.agendaRepository.findOne({
      where: { start: In([startDate, endDate]), tecnico: tecnicoUser },
    });
    if (horárioOcupado) {
      throw new ForbiddenException(
        'O técnico já possui um compromisso nesse horário',
      );
    }

    const horarioComercial =
      startDate.getHours() >= 8 && endDate.getHours() <= 17;
    if (!horarioComercial) {
      throw new NotAcceptableException(
        'Compromissos só podem ser agendados em horário comercial válido (08:00 - 17:00)',
      );
    }

    const diaUtil = startDate.getDay() !== 0 && startDate.getDay() !== 6;
    if (!diaUtil) {
      throw new NotAcceptableException(
        'Compromissos só podem ser agendados em dias úteis (segunda a sexta-feira)',
      );
    }

    // const clienteUsina = await this.entidadeRepository.findOne({where: {nome: cliente}});
    // if(!clienteUsina){
    //     throw new NotAcceptableException('Cliente não encontrado');
    // }

    // const usinaEntity = await this.usinaRepository.findOne({where: {nome: usina, entidade: clienteUsina}});
    // if(!usinaEntity){
    //     throw new NotAcceptableException('Usina não encontrada para o cliente informado');
    // }

    // const equipamentoEntity = await this.equipamentoRepository.findOne({where: {nome: equipamento, usina: usinaEntity}});
    // if(!equipamentoEntity){
    //     throw new NotAcceptableException('Equipamento não encontrado para a usina informada');
    // }

    const newEvent = {
      start: startDate,
      end: endDate,
      tag,
      tecnico: tecnicoUser,
      cliente,
      usina,
      status,
      equipamento,
    };

    const createdEvent = this.agendaRepository.create(newEvent);
    return await this.agendaRepository.save(createdEvent);
  }

  async getAllEvents(): Promise<Agenda[]> {
    return await this.agendaRepository.find({ relations: ['tecnico'] });
  }

  async findEventById(id: string): Promise<Agenda[]> {

    const user = await this.userRepository.findOne({where: {id}});
    if(!user){
      throw new NotAcceptableException('Usuário não encontrado');
    }

    const usersEvent = await this.agendaRepository.find({
      where: { tecnico: { id: user.id } },
    });

    if (!usersEvent) {
      throw new NotFoundException('Nenhum agendamento encontrado');
    }

    return usersEvent;
  }

  async agendaPorEntidade(entidadeNome: string): Promise<Agenda[]> {
    // const entidade = await this.entidadeRepository.findOne({
    //   where: { nome: entidadeNome },
    // });

    // if (!entidade) {
    //   throw new NotFoundException('Entidade não encontrada');
    // }

    const entidadeAgenda =  await this.agendaRepository.find({
      where: { cliente: entidadeNome },
    });

    return entidadeAgenda;
  }
}