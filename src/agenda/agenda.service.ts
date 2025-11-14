import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
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

  private async checkConflito(
    tecnicoId: string,
    tecnicoCampo: string,
    eventId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const horaInicio = startDate.getHours();
    const horaFim = endDate.getHours();


    // Bloqueia fora do horário comercial (8h às 17h)
    if ( horaInicio < 8 || horaInicio > 17 || horaFim > 17 || horaFim < 8) {
      throw new BadRequestException(
        'O teste só pode ser marcado entre 08:00 e 17:00.',
      );
    }

    const dataAtual = new Date();
    if (startDate < dataAtual) {
      throw new BadRequestException(
        'O teste não pode começar antes da data atual',
      );
    }
    const conflito = await this.agendaRepository
      .createQueryBuilder('agenda')
      .where('agenda.id != :eventId', { eventId })
      .andWhere('agenda.tecnicoId = :tecnicoId', { tecnicoId })
      .andWhere('agenda.tecnicoCampo = :tecnicoCampo', { tecnicoCampo })
      .andWhere('(agenda.start < :end OR agenda.end > :start)', {
        start: startDate,
        end: endDate,
      })
      .getOne();

    if (conflito) {
      throw new ForbiddenException(
        'O técnico já possui um compromisso nesse horário.',
      );
    }
  }

  private async checaDiasUteis(startDate: Date, endDate: Date): Promise<void> {
    const horarioComercial =
      startDate.getHours() >= 8 && endDate.getHours() <= 17;
    if (!horarioComercial) {
      throw new NotAcceptableException(
        'Compromissos só podem ser agendados entre 08:00 e 17:00.',
      );
    }

    const diaUtil = startDate.getDay() !== 0 && startDate.getDay() !== 6;
    if (!diaUtil) {
      throw new NotAcceptableException(
        'Compromissos só podem ser agendados em dias úteis (segunda a sexta).',
      );
    }
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Agenda> {
  const {
    start,
    end,
    tag,
    tecnicoEmail,
    tecnicoCampo,
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
  const now = new Date();

  if (startDate < now || endDate < now) {
    throw new NotAcceptableException('Datas inválidas');
  }

  // 🔒 Verifica conflitos de horário para técnico principal OU técnico de campo
  const conflito = await this.agendaRepository
    .createQueryBuilder('agenda')
    .where('(agenda.tecnicoId = :tecnicoId OR agenda.tecnicoCampo = :tecnicoCampo)', {
      tecnicoId: tecnicoUser.id,
      tecnicoCampo,
    })
    .andWhere('(agenda.start < :end AND agenda.end > :start)', {
      start: startDate,
      end: endDate,
    })
    .getOne();

  if (conflito) {
    throw new ForbiddenException(
      'Já existe um compromisso nesse horário para o técnico ou técnico de campo.',
    );
  }

  await this.checaDiasUteis(startDate, endDate);

  const newEvent = this.agendaRepository.create({
    start: startDate,
    end: endDate,
    tag,
    tecnico: tecnicoUser,
    tecnicoCampo,
    cliente,
    usina,
    status,
    equipamento,
  });

  return await this.agendaRepository.save(newEvent);
}


  async getAllEvents(): Promise<Agenda[]> {
    return await this.agendaRepository.find({ relations: ['tecnico'] });
  }

  async getEventById(id: string){
    const event = await this.agendaRepository.findOne({
      where:{
      id
    }, 
    relations: ['tecnico']
  
  })

    if(!event){
      throw new NotFoundException('Agendamento não encontrado')
    }

    return event
  }

  async getEventesByTecnicoCampo(
    tecnicoCampo: string,
    entidade: string,
  ): Promise<Agenda[]> {
    const entidadeDoUsuário = entidade;
    const events =
      entidadeDoUsuário == 'ATI'
        ? await this.agendaRepository.find({
            where: { tecnicoCampo },
            relations: ['tecnico'],
          })
        : await this.agendaRepository.find({
            where: { tecnicoCampo, cliente: entidadeDoUsuário },
            relations: ['tecnico'],
          });

    return events;
  }

  async findEventsByUserId(id: string): Promise<Agenda[]> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotAcceptableException('Usuário não encontrado');
    }

    const usersEvent = await this.agendaRepository.find({
      where: { tecnico: { id: user.id } },
      relations: ['tecnico'],
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

    const entidadeAgenda = await this.agendaRepository.find({
      where: { cliente: entidadeNome },
    });

    return entidadeAgenda;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const event = await this.agendaRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    await this.agendaRepository.remove(event);
  }

  async updateEvent(
    user: User,
    eventId: string,
    updateEventoDto: UpdateEventDto,
  ): Promise<Agenda> {
    // Buscar evento do usuário logado
    const eventosDoUsuario = await this.findEventsByUserId(user.id);
    const eventoToUpdate = eventosDoUsuario.find((e) => e.id === eventId);

    if (!eventoToUpdate) {
      throw new NotFoundException('Evento não encontrado para esse usuário');
    }

    // Datas atualizadas
    const startDate = updateEventoDto.start
      ? new Date(updateEventoDto.start)
      : new Date(eventoToUpdate.start);
    const endDate = updateEventoDto.end
      ? new Date(updateEventoDto.end)
      : new Date(eventoToUpdate.end);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término',
      );
    }

    await this.checaDiasUteis(startDate, endDate);

    const tecnicoATI = await this.userRepository.findOne({
      where: { email: updateEventoDto.tecnicoEmail },
    });
    const { tecnicoCampo } = updateEventoDto;

    if (!tecnicoATI) {
      throw new NotFoundException('Tecnico ATI não encontrado');
    }
    const tecnicoCampoParaChecar = tecnicoCampo ?? eventoToUpdate.tecnicoCampo;

    await this.checkConflito(
      tecnicoATI.id,
      tecnicoCampoParaChecar,
      eventId,
      startDate,
      endDate,
    );

    Object.assign(eventoToUpdate, updateEventoDto);
    if (tecnicoCampo) eventoToUpdate.tecnicoCampo = tecnicoCampo;

    return await this.agendaRepository.save(eventoToUpdate);
  }
}
