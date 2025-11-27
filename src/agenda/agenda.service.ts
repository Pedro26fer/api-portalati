import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from './agenda.entity';
import { CreateEventDto } from './dto/createEvent.dto';
import { UpdateEventDto } from './dto/updateEvent.dto';
import { Usina } from 'src/usina/usina.entity';
import { Equipamentos } from 'src/equipamentos/equipamentos.entity';
import { User } from 'src/user/user.entity';
import { Entidade } from 'src/entidade/entidade.entity';
import { UserService } from 'src/user/user.service';

const BRASILia_OFFSET_HOURS = 3; // Brasília = UTC-3

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
    private readonly userService: UserService,
    @InjectRepository(Entidade)
    private readonly entidadeRepository: Repository<Entidade>,
  ) {}

  private toBrasiliaVirtualDate(utcDate: Date): Date {
    const adjusted = utcDate.getTime() - BRASILia_OFFSET_HOURS * 60 * 60 * 1000;
    return new Date(adjusted);
  }

  private parseLocalDate(dateString: string): Date {
    if (!dateString) throw new ForbiddenException('A data é obrigatória');

    const clean = dateString.replace(/Z$/, '');

    const [datePart, timePart] = clean.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second || 0);
  }

  private getBrasiliaHour(dateUtc: Date): number {
    return this.toBrasiliaVirtualDate(dateUtc).getUTCHours();
  }

  private getBrasiliaMinutes(dateUtc: Date): number {
    return this.toBrasiliaVirtualDate(dateUtc).getUTCMinutes();
  }

  private getBrasiliaDayOfWeek(dateUtc: Date): number {
    return this.toBrasiliaVirtualDate(dateUtc).getUTCDay();
  }

  private parseInputDateTime(input: string | Date): Date {
    if (input instanceof Date) return input;
    if (typeof input === 'string') {
      return this.userService.parseDateTimeLocalToUTC(input);
    }
    return new Date('invalid date');
  }

  private async checkConflito(
    tecnicoId: string,
    tecnicoCampo: string | undefined,
    exceptEventId: string | null,
    startDateUtc: Date,
    endDateUtc: Date,
  ): Promise<void> {
    const qb = this.agendaRepository.createQueryBuilder('agenda');

    qb.where(
      '(agenda.tecnicoId = :tecnicoId OR agenda.tecnicoCampo = :tecnicoCampo)',
      { tecnicoId, tecnicoCampo },
    ).andWhere('(agenda.start < :end AND agenda.end > :start)', {
      start: startDateUtc,
      end: endDateUtc,
    });

    if (exceptEventId) {
      qb.andWhere('agenda.id != :exceptEventId', { exceptEventId });
    }

    const conflito = await qb.getOne();

    if (conflito) {
      throw new ForbiddenException(
        'Já existe um compromisso nesse horário para o técnico ou técnico de campo.',
      );
    }
  }

  private assertBusinessHoursAndWorkday(startUtc: Date, endUtc: Date): void {
    const day = this.getBrasiliaDayOfWeek(startUtc);
    if (day === 0 || day === 6) {
      throw new NotAcceptableException(
        'Compromissos só podem ser agendados em dias úteis (segunda a sexta).',
      );
    }

    const startHour = this.getBrasiliaHour(startUtc);
    const endHour = this.getBrasiliaHour(endUtc);
    const endMinutes = this.getBrasiliaMinutes(endUtc);

    if (
      startHour < 8 ||
      startHour >= 17 ||
      endHour > 17 ||
      (endHour === 17 && endMinutes > 0)
    ) {
      throw new NotAcceptableException(
        'Compromissos só podem ser agendados entre 08:00 e 17:00 (Horário de Brasília).',
      );
    }
  }

async createEvent(
  userLogado: User,
  createEventDto: CreateEventDto,
): Promise<Agenda> {

  const {
    start: startInput,
    end: endInput,
    tag,
    tecnicoCampo,
    cliente,
    usina,
    status,
    equipamento,
  } = createEventDto;

  const startLocal = this.parseLocalDate(startInput);
  const endLocal = this.parseLocalDate(endInput);

  if (isNaN(startLocal.getTime()) || isNaN(endLocal.getTime())) {
    throw new BadRequestException('Formato de data inválido.');
  }

  if (startLocal >= endLocal) {
    throw new NotAcceptableException('A data de início deve ser anterior ao fim.');
  }

  const now = new Date();
  if (startLocal < now) {
    throw new NotAcceptableException('Data já passou.');
  }

  this.assertBusinessHoursAndWorkday(startLocal, endLocal);

  const dia = startLocal.toISOString().split("T")[0];

  const availability = await this.userService.getAvaibleTimesPerTeam(tag, dia);

  if (!availability || availability.length === 0) {
    throw new NotAcceptableException('Nenhum técnico disponível nesse assunto.');
  }

  // Encontrar técnicos disponíveis naquele horário
  const tecnicosDisponiveis = [];

  for (const tecnico of availability) {
    for (const slot of tecnico.freeSlots) {

      const slotStart = new Date(`${dia}T${slot.start}`);
      const slotEnd   = new Date(`${dia}T${slot.end}`);

      if (startLocal >= slotStart && endLocal <= slotEnd) {
        tecnicosDisponiveis.push(tecnico);
      }
    }
  }

  if (tecnicosDisponiveis.length === 0) {
    throw new NotAcceptableException("Nenhum técnico disponível no horário solicitado.");
  }

  const escolhido = tecnicosDisponiveis[
    Math.floor(Math.random() * tecnicosDisponiveis.length)
  ];

  const tecnicoEscolhido = await this.userRepository.findOne({
    where: { id: escolhido.tecnicoId },
  });

  if (!tecnicoEscolhido) {
    throw new NotAcceptableException("Erro ao buscar técnico escolhido.");
  }

  const newEvent = this.agendaRepository.create({
    start: startLocal,
    end: endLocal,
    tag,
    tecnico: tecnicoEscolhido,
    tecnicoCampo,
    responsavel: userLogado,
    cliente,
    usina,
    status,
    equipamento,
  });

  return await this.agendaRepository.save(newEvent);
}


  async getAllEvents(): Promise<Agenda[]> {
    const agendamentos = await this.agendaRepository.find({
      relations: ['tecnico'],
    });

    agendamentos.forEach((ag) => {
      ag.start = new Date(ag.start.getTime() - 3 * 60 * 60 * 1000);
      ag.end = new Date(ag.end.getTime() - 3 * 60 * 60 * 1000);
    });

    return agendamentos;
  }

  async getEventByResponsavelPelaAbertura(id: string): Promise<Agenda[]> {
    const loggedUser = await this.userRepository.findOne({ where: { id } });
    if (!loggedUser) {
      throw new ForbiddenException('Usuário logado não encontrado');
    }

    const eventsOpenedForTheLoggedUser = await this.agendaRepository.find({
      where: {
        responsavel: { id },
      },
    });

    if (!eventsOpenedForTheLoggedUser) {
      throw new NotFoundException('Eventos não encontrados');
    }

    return eventsOpenedForTheLoggedUser;
  }

  async getEventById(id: string) {
    const event = await this.agendaRepository.findOne({
      where: {
        id,
      },
      relations: ['tecnico'],
    });

    if (!event) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return event;
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
      where: { responsavel: { id: user.id } },
      relations: ['tecnico'],
    });

    if (!usersEvent || usersEvent.length === 0) {
      throw new NotFoundException('Nenhum agendamento encontrado');
    }

    return usersEvent;
  }

  async agendaPorEntidade(id: string): Promise<Agenda[]> {
    const loggedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['equipe', 'equipe.entidade'],
    });
    if (!loggedUser) {
      throw new UnauthorizedException('Reinicie a sessão');
    }
    const entidadeDoUsuarioLogado = loggedUser.equipe.entidade.nome;
    console.log(entidadeDoUsuarioLogado);

    const eventsByEntidade = this.agendaRepository.find({
      where: { cliente: entidadeDoUsuarioLogado },
      relations: ['tecnico'],
    });

    return eventsByEntidade;
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
    const eventoToUpdate = await this.getEventById(eventId);

    if (!eventoToUpdate) {
      throw new NotFoundException('Evento não encontrado para esse usuário');
    }

    // Se vierem novas datas como string, parseamos como BRT -> UTC.
    const startUtc = updateEventoDto.start
      ? this.parseInputDateTime(updateEventoDto.start)
      : new Date(eventoToUpdate.start);

    const endUtc = updateEventoDto.end
      ? this.parseInputDateTime(updateEventoDto.end)
      : new Date(eventoToUpdate.end);

    if (isNaN(startUtc.getTime()) || isNaN(endUtc.getTime())) {
      throw new BadRequestException('Formato de data e hora inválido.');
    }

    if (startUtc.getTime() >= endUtc.getTime()) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término',
      );
    }

    // dia útil + horário comercial (BRT)
    this.assertBusinessHoursAndWorkday(startUtc, endUtc);

    const tecnicoATI = await this.userRepository.findOne({
      where: { email: updateEventoDto.tecnicoEmail },
    });

    if (!tecnicoATI) {
      throw new NotFoundException('Tecnico ATI não encontrado');
    }

    const tecnicoCampoParaChecar =
      updateEventoDto.tecnicoCampo ?? eventoToUpdate.tecnicoCampo;

    // checa conflito excluindo o próprio evento
    await this.checkConflito(
      tecnicoATI.id,
      tecnicoCampoParaChecar,
      eventId,
      startUtc,
      endUtc,
    );

    // aplica mudanças (mantendo objetos Date UTC)
    eventoToUpdate.start = startUtc;
    eventoToUpdate.end = endUtc;
    if (updateEventoDto.tecnicoCampo)
      eventoToUpdate.tecnicoCampo = updateEventoDto.tecnicoCampo;
    if (updateEventoDto.tecnicoEmail) eventoToUpdate.tecnico = tecnicoATI;
    // aplica outras propriedades do DTO (cliente, status, equipamento, etc.)
    Object.assign(eventoToUpdate, {
      tag: updateEventoDto.tag ?? eventoToUpdate.tag,
      cliente: updateEventoDto.cliente ?? eventoToUpdate.cliente,
      usina: updateEventoDto.usina ?? eventoToUpdate.usina,
      status: updateEventoDto.status ?? eventoToUpdate.status,
      equipamento: updateEventoDto.equipamento ?? eventoToUpdate.equipamento,
    });

    return await this.agendaRepository.save(eventoToUpdate);
  }
}
