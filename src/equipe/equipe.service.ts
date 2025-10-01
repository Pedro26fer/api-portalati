import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipe } from './equipe.entity';
import { Entidade } from 'src/entidade/entidade.entity';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';

@Injectable()
export class EquipeService {
  constructor(
    @InjectRepository(Equipe)
    private equipeRepository: Repository<Equipe>,
    @InjectRepository(Entidade)
    private entidadeRepository: Repository<Entidade>,
  ) {}

  async create(createEquipeDto: CreateEquipeDto): Promise<Equipe> {
    const { nome, nivel, entidade } = createEquipeDto;

    const entidadeReal = await this.entidadeRepository.findOne({
      where: { nome: entidade },
    });

    if (!entidadeReal) {
      throw new NotFoundException(
        'Entidade não encontrada, cadastre-a primeiro',
      );
    }

    const equipeAlreadyExists = await this.equipeRepository.findOne({
      where: { nome },
    });

    if (equipeAlreadyExists) {
      throw new ForbiddenException('Já existe uma equipe com esse nome');
    }

    const newEquipe = await this.equipeRepository.create({
      ...createEquipeDto,
      entidade: entidadeReal,
    });

    return await this.equipeRepository.save(newEquipe);
  }

  async findAll(): Promise<Equipe[]> {
    return await this.equipeRepository.find({ relations: ['entidade'] });
  }

  async findById(id: string): Promise<Equipe> {
    const equipe = await this.equipeRepository.findOne({ where: { id }, relations: ['entidade'] });
    if (!equipe) {
      throw new NotFoundException('Equipe não encontrada');
    }
    return equipe;
  }

  async updateEquipe(id: string, updateEquipeDto: UpdateEquipeDto): Promise<Equipe>{
    const equipe = await this.findById(id);

    const {nome, nivel, entidade} = equipe;

    const nomeLareadyExists = await this.equipeRepository.findOne({ where: { nome } });

    if (nomeLareadyExists && nomeLareadyExists.id !== id) {
      throw new ForbiddenException('Já existe uma equipe com esse nome');
    }

    const entidadeReal = await this.entidadeRepository.findOne({
      where: { nome: entidade.nome },
    });

    if (!entidadeReal) {
      throw new NotFoundException(
        'Entidade não encontrada, cadastre-a primeiro',
      );
    }

    await this.equipeRepository.update(id, {
      ...updateEquipeDto,
      entidade: entidadeReal,
    });

    return await this.findById(id);
  }

  async removeEquipe(id: string): Promise<void>{
    const equipeToRemove = await this.findById(id);
    await this.equipeRepository.remove(equipeToRemove);
  }
}
