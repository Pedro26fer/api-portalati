import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipe } from './equipe.entity';
import { Entidade } from 'src/entidade/entidade.entity';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';
import { User } from 'src/user/user.entity';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class EquipeService {
  constructor(
    @InjectRepository(Equipe)
    private equipeRepository: Repository<Equipe>,
    @InjectRepository(Entidade)
    private entidadeRepository: Repository<Entidade>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createEquipeDto: CreateEquipeDto): Promise<Equipe> {
    const { nome, supervisor, entidade, parent_equipe } = createEquipeDto;
    const newEquipe = await this.equipeRepository.create();

    newEquipe.nome = nome;

    const entidadeReal = await this.entidadeRepository.findOne({
      where: { nome: entidade },
    });

    if (!entidadeReal) {
      throw new NotFoundException(
        'Entidade não encontrada, cadastre-a primeiro',
      );
    }
    newEquipe.entidade = entidadeReal;

    const supervisorName = await this.userRepository.findOne({
      where: { email: supervisor },
    });

    if (!supervisorName) {
      throw new NotFoundException('Supervisor não encontrado');
    }

    newEquipe.supervisor = supervisorName;

    const equipeAlreadyExists = await this.equipeRepository.findOne({
      where: { nome },
    });

    if (equipeAlreadyExists) {
      throw new ForbiddenException('Já existe uma equipe com esse nome');
    }

    if (parent_equipe) {
      const parentEquip = await this.equipeRepository.findOne({
        where: { nome: parent_equipe },
      });
      if (!parentEquip) {
        throw new NotFoundException('Equipe pai não encontrada');
      }

      newEquipe.parent_equipe = parentEquip;

      if (parentEquip.supervisor == supervisorName) {
        throw new ForbiddenException(
          'O supervisor não pode ser o mesmo da equipe pai',
        );
      }
    }
    const savedEquipe = await this.equipeRepository.save(newEquipe);

    supervisorName.equipe_supervisionada = savedEquipe;
    supervisorName.equipe = savedEquipe;
    await this.userRepository.save(supervisorName);

    return plainToInstance(Equipe, savedEquipe, { excludeExtraneousValues: true });
  }

  async findAll(): Promise<Equipe[]> {
    return await this.equipeRepository.find({
      relations: ['entidade', 'supervisor', 'integrantes', 'parent_equipe', 'sub_equipes.integrantes',],
    });
  }
  

  async findById(id: string): Promise<Equipe> {
    const equipe = await this.equipeRepository.findOne({
      where: { id },
      relations: ['entidade', 'supervisor', 'integrantes', 'sub_equipes'],
    });
    if (!equipe) {
      throw new NotFoundException('Equipe não encontrada');
    }
    return equipe;
  }

  async findByName(nome: string): Promise<Equipe> {
    const equipe = await this.equipeRepository.findOne({
      where: { nome },
      relations: ['entidade', 'supervisor'],
    });
    if (!equipe) {
      throw new NotFoundException('Equipe não encontrada');
    }
    return plainToInstance(Equipe, equipe, { excludeExtraneousValues: true });
  }

  async updateEquipe(
  id: string,
  updateEquipeDto: UpdateEquipeDto,
): Promise<Equipe> {
  const equipe = await this.findById(id);

  if (!equipe) {
    throw new NotFoundException('Equipe não encontrada');
  }

  // Atualiza o nome, se enviado
  if (updateEquipeDto.nome) {
    const novoNome = updateEquipeDto.nome.trim();

    const equipeWithSameName = await this.equipeRepository.findOne({
      where: { nome: novoNome },
    });

    if (equipeWithSameName && equipeWithSameName.id !== id) {
      throw new ConflictException('Já existe uma equipe com esse nome');
    }
    // Só altera se for diferente do atual
    if (novoNome !== equipe.nome) {
      equipe.nome = novoNome;
    }
  }

  // Atualiza o nível, se enviado
  if (updateEquipeDto.nivel) {
    equipe.nivel = updateEquipeDto.nivel;
  }

  // Atualiza o supervisor, se enviado
  if (updateEquipeDto.supervisor) {
    const supervisor = await this.userRepository.findOne({
      where: { pNome: updateEquipeDto.supervisor },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor não encontrado');
    }

    if (
      equipe.supervisor &&
      supervisor.id === equipe.supervisor.id
    ) {
      throw new BadRequestException('Esse é o supervisor atual da equipe');
    }

    if (supervisor.equipe_supervisionada) {
      throw new ConflictException(
        'Esse supervisor já está supervisionando outra equipe',
      );
    }

    equipe.supervisor = supervisor;
  }

  // Atualiza a entidade, se enviada
  if (updateEquipeDto.entidade) {
    const entidade = await this.entidadeRepository.findOne({
      where: { nome: updateEquipeDto.entidade },
    });

    if (!entidade) {
      throw new NotFoundException('Entidade não encontrada');
    }

    equipe.entidade = entidade;
  }

  // Atualiza a equipe pai, se enviada
  if (updateEquipeDto.parent_equipe) {
    const parentEquipe = await this.equipeRepository.findOne({
      where: { nome: updateEquipeDto.parent_equipe },
    });

    if (!parentEquipe) {
      throw new NotFoundException('Equipe pai não encontrada');
    }

    if (parentEquipe.supervisor?.id === equipe.supervisor?.id) {
      throw new ConflictException(
        'O supervisor não pode ser o mesmo da equipe pai',
      );
    }

    equipe.parent_equipe = parentEquipe;
  }

  // Salva e retorna a nova equipe
  const novaEquipe = await this.equipeRepository.save(equipe);

  return plainToInstance(Equipe, novaEquipe, { excludeExtraneousValues: true });
}

  async removeEquipe(id: string): Promise<void> {
    const equipeToRemove = await this.findById(id);
    await this.equipeRepository.remove(equipeToRemove);
  }
}
