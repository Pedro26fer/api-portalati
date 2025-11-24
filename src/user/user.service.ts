import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { Equipe } from 'src/equipe/equipe.entity';
import { Entidade } from 'src/entidade/entidade.entity';
import { Agenda } from '../agenda/agenda.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/createUsuarioDto.dto';
import { UpdateUserDTO } from './dto/updateUsuarioDto.dto';

// --- INTERFACES AUXILIARES ---

interface TimeSlot {
  start: Date;
  end: Date;
}

export interface TechnicianAvailability {
  tecnicoId: string;
  tecnicoNome: string;
  freeSlots: TimeSlot[];
}

export interface FormattedTechnicianAvailability {
  tecnicoId: string;
  tecnicoNome: string;
  freeSlots: { start: string; end: string }[];
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Equipe)
    private readonly equipeRepository: Repository<Equipe>,
    @InjectRepository(Entidade)
    private readonly entidadeRepository: Repository<Entidade>,
    @InjectRepository(Agenda)
    private readonly agendaRepository: Repository<Agenda>,
  ) {}

  // --- 1. FUNÇÕES AUXILIARES ---

  /**
   * Converte string de data para Date em UTC (Meia-noite).
   * Aceita AAAA-MM-DD (ISO) ou DD/MM/AAAA (BR).
   */
  private parseDate(dataString: string): Date {
    // Tenta formato ISO (AAAA-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      const [year, month, day] = dataString.split('-').map(Number);
      // Cria data em UTC para evitar deslocamento de fuso
      return new Date(Date.UTC(year, month - 1, day));
    }

    // Tenta formato brasileiro (DD/MM/AAAA)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
      const [day, month, year] = dataString.split('/').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    }

    // Fallback (apenas para strings que podem ser datas válidas, mas sem garantias de fuso)
    const date = new Date(dataString);
    if (!isNaN(date.getTime())) return date;

    return new Date('invalid date');
  }

  /**
   * Converte uma string de data e hora (assumida como UTC-3 / Brasília) para um objeto Date correto em UTC.
   * @param dateTimeString String no formato ISO (AAAA-MM-DDTHH:mm:ss.sss) SEM o 'Z'.
   * @returns Date Objeto Date em UTC.
   */
  /**
   * Converte string "AAAA-MM-DDTHH:mm" assumindo que ela representa
   * horário LOCAL do usuário (Brasília).
   *
   * Exemplo: "2025-02-10T14:00" → converte para UTC antes de salvar.
   */
  public parseDateTimeLocalToUTC(dateTimeString: string): Date {
    if (!dateTimeString) return new Date('invalid date');

    // dateTimeString: "2025-02-10T14:00"
    const [datePart, timePart] = dateTimeString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Cria a data como se fosse no fuso local (máquina = BRT)
    const localDate = new Date(year, month - 1, day, hour, minute);

    // Transforma em UTC automaticamente
    return new Date(localDate.getTime());
  }

  private mergeIntervals(intervals: TimeSlot[]): TimeSlot[] {
    if (intervals.length === 0) return [];

    intervals.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: TimeSlot[] = [];
    let currentInterval = { ...intervals[0] };

    for (let i = 1; i < intervals.length; i++) {
      const nextInterval = intervals[i];

      if (currentInterval.end.getTime() >= nextInterval.start.getTime()) {
        if (nextInterval.end.getTime() > currentInterval.end.getTime()) {
          currentInterval.end = nextInterval.end;
        }
      } else {
        merged.push(currentInterval);
        currentInterval = { ...nextInterval };
      }
    }
    merged.push(currentInterval);
    return merged;
  }

  private getFreeSlots(
    occupiedSlots: TimeSlot[],
    fullDayStart: Date,
    fullDayEnd: Date,
  ): TimeSlot[] {
    const freeSlots: TimeSlot[] = [];
    let currentFreeTime = fullDayStart;
    const mergedOccupied = this.mergeIntervals(occupiedSlots);

    for (const occupied of mergedOccupied) {
      if (occupied.start.getTime() > currentFreeTime.getTime()) {
        freeSlots.push({ start: currentFreeTime, end: occupied.start });
      }
      if (occupied.end.getTime() > currentFreeTime.getTime()) {
        currentFreeTime = occupied.end;
      }
    }

    if (currentFreeTime.getTime() < fullDayEnd.getTime()) {
      freeSlots.push({ start: currentFreeTime, end: fullDayEnd });
    }
    return freeSlots;
  }

  // --- 2. BUSCA NO BANCO DE DADOS ---

  private async getHorariosOcupadosPorEquipe(
    tag: string,
    dataDesejada: Date, // Data interpretada LOCALMENTE
  ): Promise<Agenda[]> {
    // 1. Busca técnicos ativos da equipe
    const tecnicosPorTime = await this.userRepository.find({
      where: { equipe: { nome: tag }, isActive: true },
      relations: ['equipe'],
    });

    if (tecnicosPorTime.length === 0) return [];

    const tecnicoIds = tecnicosPorTime.map((t) => t.id);

    // 2. Criar limites do dia EM HORÁRIO LOCAL (sem UTC)
    const startOfDay = new Date(dataDesejada);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dataDesejada);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Buscar agendamentos (sem UTC!)
    return await this.agendaRepository
      .createQueryBuilder('agenda')
      .leftJoinAndSelect('agenda.tecnico', 'tecnico')
      .where('agenda.tecnicoId IN (:...tecnicoIds)', { tecnicoIds })
      .andWhere('(agenda.start < :endOfDay AND agenda.end > :startOfDay)', {
        startOfDay,
        endOfDay,
      })
      .orderBy('agenda.start', 'ASC')
      .getMany();
  }

  // --- 3. MÉTODO PRINCIPAL ---

  async getAvaibleTimesPerTeam(
    tag: string,
    dataString: string,
  ): Promise<FormattedTechnicianAvailability[]> {
    // 1. Interpretar a data enviada como HORÁRIO LOCAL
    // const dataDesejada = new Date(dataString);
    // Forçar interpretação local (corrige o bug do "dia anterior")
    const [ano, mes, dia] = dataString.split('-').map(Number);
    const dataDesejada = new Date(ano, mes - 1, dia); // <-- LOCAL

    if (isNaN(dataDesejada.getTime())) {
      throw new BadRequestException('Formato de data inválido.');
    }

    // 2. Definir jornada local (08:00 - 17:00)
    const fullDayStart = new Date(dataDesejada);
    fullDayStart.setHours(8, 0, 0, 0);

    const fullDayEnd = new Date(dataDesejada);
    fullDayEnd.setHours(17, 0, 0, 0);

    // 3. Buscar agendamentos locais
    const occupiedEvents = await this.getHorariosOcupadosPorEquipe(
      tag,
      dataDesejada,
    );

    // 4. Agrupar por técnico
    const occupiedByTechnician = new Map<
      string,
      { tecnicoNome: string; occupiedSlots: TimeSlot[] }
    >();

    for (const event of occupiedEvents) {
      if (!event.tecnico) continue;
      if (event.start >= event.end) continue;

      const tecnicoId = event.tecnico.id;
      const tecnicoNome = `${event.tecnico.pNome || ''} ${event.tecnico.uNome || ''}`;

      if (!occupiedByTechnician.has(tecnicoId)) {
        occupiedByTechnician.set(tecnicoId, {
          tecnicoNome,
          occupiedSlots: [],
        });
      }

      // ------ BUFFER COMPLETO ------
      // 30 min antes e 30 min depois
      const bufferedStart = new Date(event.start.getTime() - 30 * 60 * 1000);
      const bufferedEnd = new Date(event.end.getTime() + 30 * 60 * 1000);

      // Limitar ao expediente
      const start = bufferedStart < fullDayStart ? fullDayStart : bufferedStart;
      const end = bufferedEnd > fullDayEnd ? fullDayEnd : bufferedEnd;

      if (start < end) {
        occupiedByTechnician.get(tecnicoId)!.occupiedSlots.push({ start, end });
      }
    }

    // 5. Calcular disponibilidade
    const availability: TechnicianAvailability[] = [];

    for (const [
      tecnicoId,
      { tecnicoNome, occupiedSlots },
    ] of occupiedByTechnician.entries()) {
      const freeSlots = this.getFreeSlots(
        occupiedSlots,
        fullDayStart,
        fullDayEnd,
      );
      availability.push({ tecnicoId, tecnicoNome, freeSlots });
    }

    // 6. Técnicos sem agendamento: dia totalmente livre
    const allTechnicians = await this.userRepository.find({
      where: { equipe: { nome: tag }, isActive: true },
    });

    for (const t of allTechnicians) {
      if (!occupiedByTechnician.has(t.id)) {
        availability.push({
          tecnicoId: t.id,
          tecnicoNome: `${t.pNome || ''} ${t.uNome || ''}`,
          freeSlots: [{ start: fullDayStart, end: fullDayEnd }],
        });
      }
    }

    // 7. Formatar saída
    return availability.map((tech) => ({
      tecnicoId: tech.tecnicoId,
      tecnicoNome: tech.tecnicoNome,
      freeSlots: tech.freeSlots.map((slot) => ({
        start: slot.start.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        end: slot.end.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      })),
    }));
  }

  async createUser(createUsuarioDto: CreateUsuarioDto): Promise<User> {
    this.logger.log('Criando usuário...');
    const { email, password, pNome, uNome, fotoPerfil, equipe } =
      createUsuarioDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser && existingUser.isActive == true) {
      this.logger.warn(
        `Tentativa de criar usuário com email já existente: ${email}`,
      );
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let resolvedEquipe = undefined;

    if (equipe) {
      const realEquipe = await this.equipeRepository.findOne({
        where: { nome: equipe },
      });
      if (!realEquipe) {
        this.logger.warn(`Equipe não encontrada: ${equipe}`);
        throw new NotFoundException('Equipe não encontrada');
      }
      resolvedEquipe = realEquipe;
    }

    const newUser = this.userRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      equipe: resolvedEquipe,
    });

    this.logger.log(`Usuário criado com sucesso: ${email}`);

    await this.userRepository.save(newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    this.logger.log('Buscando todos os usuários...');
    return await this.userRepository.find({
      relations: [
        'equipe',
        'equipe.entidade',
        'equipe_supervisionada',
        'equipe.parent_equipe',
      ],
    });
  }

  async getUserById(id: string): Promise<User> {
    this.logger.log(`Buscando usuário com ID: ${id}`);
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['equipe', 'equipe.entidade'],
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (!user) {
      this.logger.warn(`Usuário não encontrado com ID: ${id}`);
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async getUserAti(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.equipe', 'equipe')
      .leftJoinAndSelect('equipe.parent_equipe', 'parent')
      .leftJoinAndSelect('equipe.entidade', 'entidade')
      .where('LOWER(entidade.nome) LIKE :entidade', { entidade: '%ati%' })
      .andWhere(
        '(LOWER(equipe.nome) LIKE :suporte OR LOWER(parent.nome) LIKE :suporte)',
        { suporte: '%suporte%' },
      )
      .getMany();
  }

  async inactivateUser(id: string): Promise<void> {
    this.logger.log(`Inativando usuário com ID: ${id}`);
    const userToInactivate = await this.getUserById(id);
    if (!userToInactivate.isActive) {
      this.logger.warn(
        `Tentativa de inativar usuário já inativo com ID: ${id}`,
      );
      throw new ForbiddenException('Usuário já está inativo');
    }
    userToInactivate.isActive = false;
    await this.userRepository.save(userToInactivate);
  }

  async activateUser(id: string): Promise<void> {
    this.logger.log(`Ativando usuário com ID: ${id}`);
    const userToActivate = await this.getUserById(id);
    if (userToActivate.isActive) {
      this.logger.warn(`Tentativa de ativar usuário já ativo com ID: ${id}`);
      throw new ForbiddenException('Usuário já está ativo');
    }
    userToActivate.isActive = true;
    this.logger.log(`Usuário com ID: ${id} ativado com sucesso`);
    await this.userRepository.save(userToActivate);
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deletando usuário com ID: ${id}`);
    const userToDelete = await this.getUserById(id);
    await this.userRepository.remove(userToDelete);
  }

  async updateLastAccess(id: string, dataLocal?: string): Promise<void> {
    this.logger.log(`Atualizando último acesso do usuário com ID: ${id}`);
    const user = await this.getUserById(id);
    user.ultimoAcesso = dataLocal ? new Date(dataLocal) : new Date();
    await this.userRepository.save(user);
  }

  // async getAvaibleTimesPerTeam(tag: string): Promise<any> {
  //   const tecnicosPorTime = await this.userRepository.find({
  //     where: {
  //       equipe: {
  //         nome: tag,
  //       },
  //     },
  //   });
  // }

  async updatePersonalInfo(
    id: string,
    updatePersonalInfo: UpdateUserDTO,
  ): Promise<User> {
    this.logger.log(`Atualizando informações do usuário com ID: ${id}`);
    const user = await this.getUserById(id);
    if (!user || user.isActive == false) {
      this.logger.warn(`Usuário não encontrado ou inativo com ID: ${id}`);
      throw new NotFoundException('Usuário não encontrado ou inativo!');
    }

    if (updatePersonalInfo.email && updatePersonalInfo.email !== user.email) {
      this.logger.log(`Atualizando email do usuário com ID: ${id}`);
      const emailExists = await this.userRepository.findOne({
        where: { email: updatePersonalInfo.email },
      });
      if (emailExists && emailExists.isActive == true) {
        this.logger.warn(
          `Tentativa de atualizar para um email já existente: ${updatePersonalInfo.email}`,
        );
        throw new ConflictException('Email já está em uso');
      }
    }

    if (updatePersonalInfo.password) {
      this.logger.log(`Atualizando senha do usuário com ID: ${id}`);
      const hashedNewPassword = await bcrypt.hash(
        updatePersonalInfo.password,
        10,
      );
      updatePersonalInfo.password = hashedNewPassword;
    }

    if (updatePersonalInfo.equipe) {
      const equipe = await this.equipeRepository.findOne({
        where: { nome: updatePersonalInfo.equipe },
      });
      if (!equipe) {
        this.logger.warn(`Equipe não encontrada: ${updatePersonalInfo.equipe}`);
        throw new NotFoundException(
          `Equipe não encontrada: ${updatePersonalInfo.equipe}`,
        );
      } else if (equipe.supervisor == user) {
        this.logger.warn(
          `Usuário é supervisor da equipe: ${updatePersonalInfo.equipe}, não pode ser integrante`,
        );
        throw new ForbiddenException(
          `Usuário já é supervisor da equipe: ${updatePersonalInfo.equipe}, não pode ser integrante`,
        );
      }
      user.equipe = equipe;
    }

    return await this.userRepository.save({
      ...user,
      ...updatePersonalInfo,
      equipe: user.equipe,
    });
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Buscando usuário com email: ${email}`);
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['equipe', 'equipe.entidade'],
    });
    if (!user) {
      this.logger.warn(`Usuário não encontrado com email: ${email}`);
      throw new NotFoundException('Usuário não encontrado');
    } else if (!user.isActive) {
      this.logger.warn(`Usuário inativo com email: ${email}`);
      throw new ConflictException('Usuário se encontra inativo');
    }

    return user;
  }
}
