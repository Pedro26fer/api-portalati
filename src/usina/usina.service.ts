import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Usina } from './usina.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsinaDto } from './dto/create-usina.dto';
import { UpdateUsinaDto } from './dto/update-usina.dto';
import { Entidade } from 'src/entidade/entidade.entity';

@Injectable()
export class UsinaService {
  private readonly logger = new Logger(UsinaService.name);
  constructor(
    @InjectRepository(Usina)
    private readonly usinaRepository: Repository<Usina>,
    @InjectRepository(Entidade)
    private readonly entidadeRepository: Repository<Entidade>,
  ) {}

  async createUsina(createUsinadto: CreateUsinaDto): Promise<Usina> {
    this.logger.log('Criando usina...');
    const usinaAlreadyExists = await this.usinaRepository.findOne({
      where: { nome: createUsinadto.nome },
    });
    if (usinaAlreadyExists) {
      this.logger.warn(`Tentativa de criar usina com nome já existente: ${createUsinadto.nome}`);
      throw new ConflictException(
        'Uma usina com este nome já existe no sistema',
      );
    }

    const { entidade } = createUsinadto;

    const entidadeBuscada = await this.entidadeRepository.findOne({where: {nome: entidade}})
    if(!entidadeBuscada){
      this.logger.warn(`Entidade não encontrada: ${entidade}`);
        throw new NotFoundException('Entidade não encontrada')
    }

    const newUsina = await this.usinaRepository.save({...createUsinadto, entidade: entidadeBuscada});

    return newUsina;
  }

  async findAll(): Promise<Usina[]> {
    this.logger.log('Buscando todas as usinas...');
    return await this.usinaRepository.find({relations: ['entidade']});
  }

  async specificUsina(id: string): Promise<Usina> {
    this.logger.log(`Buscando usina com ID: ${id}`);
    const usina = await this.usinaRepository.findOne({ where: { id }, relations: ['entidade'] });
    if (!usina) {
      this.logger.warn(`Usina não encontrada com ID: ${id}`);
      throw new NotFoundException('Usina não encontrada');
    }
    return usina;
  }

  async specificUsinaForNome(nome: string): Promise<Usina> {
    this.logger.log(`Buscando usina com nome: ${nome}`);
    const usina = await this.usinaRepository.findOne({ where: { nome } });
    if (!usina) {
      this.logger.warn(`Usina não encontrada com nome: ${nome}`);
      throw new NotFoundException('Usina não encontrada');
    }
    return usina;
  }

  async updateUsinaInfo(
    id: string,
    updateUsinaDto: UpdateUsinaDto,
  ): Promise<Usina> {
    this.logger.log(`Atualizando usina com ID: ${id}`);
    const usinaToUpdate = await this.specificUsina(id);

    if (Object.prototype.hasOwnProperty.call(updateUsinaDto, 'aceito')) {
      if (updateUsinaDto.aceito === true) {
        this.logger.log(`Aceitando usina com ID: ${id}`);
        usinaToUpdate.data_aceite = new Date();
      } else {
        this.logger.log(`Rejeitando usina com ID: ${id}`);
        usinaToUpdate.data_aceite = null;
      }
    }

    const dataAtual = new Date();

    if (updateUsinaDto.data_aceite) {
      if (updateUsinaDto.data_aceite > dataAtual) {
        this.logger.warn(`Tentativa de definir data de aceite futura para usina com ID: ${id}`);
        throw new ForbiddenException(
          'A data de aceite não pode ser maior que a data atual',
        );
      } else {
        usinaToUpdate.aceito = true;
      }
    }

    if (updateUsinaDto.entidade) {
      const entidadeBuscada = await this.entidadeRepository.findOne({where: {nome: updateUsinaDto.entidade}})
      if(!entidadeBuscada){
        this.logger.warn(`Entidade não encontrada: ${updateUsinaDto.entidade}`);
        throw new NotFoundException('Entidade não encontrada')
      }
      usinaToUpdate.entidade = entidadeBuscada;
    }

    this.logger.log(`Salvando usina atualizada com ID: ${id}`);
    const usinaUpdated = await this.usinaRepository.save({
      ...usinaToUpdate,
      ...updateUsinaDto,
      entidade: usinaToUpdate.entidade,
    });

    return usinaUpdated;
  }

  async removeUsina(id: string): Promise<void> {
    this.logger.log(`Removendo usina com ID: ${id}`);
    await this.specificUsina(id);
    await this.usinaRepository.delete(id);
  }
}
