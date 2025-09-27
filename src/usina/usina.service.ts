import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Usina } from './usina.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsinaDto } from './dto/create-usina.dto';
import { UpdateUsinaDto } from './dto/update-usina.dto';
import { Entidade } from 'src/entidade/entidade.entity';

@Injectable()
export class UsinaService {
  constructor(
    @InjectRepository(Usina)
    private readonly usinaRepository: Repository<Usina>,
    @InjectRepository(Entidade)
    private readonly entidadeRepository: Repository<Entidade>,
  ) {}

  async createUsina(createUsinadto: CreateUsinaDto): Promise<Usina> {
    const usinaAlreadyExists = await this.usinaRepository.findOne({
      where: { nome: createUsinadto.nome },
    });
    if (usinaAlreadyExists) {
      throw new ConflictException(
        'Uma usina com este nome já existe no sistema',
      );
    }

    const { entidade } = createUsinadto;

    const entidadeBuscada = await this.entidadeRepository.findOne({where: {nome: entidade}})
    if(!entidadeBuscada){
        throw new NotFoundException('Entidade não encontrada')
    }

    const newUsina = await this.usinaRepository.save({...createUsinadto, entidade: entidadeBuscada});

    return newUsina;
  }

  async findAll(): Promise<Usina[]> {
    return await this.usinaRepository.find({relations: ['entidade']});
  }

  async specificUsina(id: string): Promise<Usina> {
    const usina = await this.usinaRepository.findOne({ where: { id }, relations: ['entidade'] });
    if (!usina) {
      throw new NotFoundException('Usina não encontrada');
    }
    return usina;
  }

  async specificUsinaForNome(nome: string): Promise<Usina> {
    const usina = await this.usinaRepository.findOne({ where: { nome } });
    if (!usina) {
      throw new NotFoundException('Usina não encontrada');
    }
    return usina;
  }

  async updateUsinaInfo(
    id: string,
    updateUsinaDto: UpdateUsinaDto,
  ): Promise<Usina> {
    const usinaToUpdate = await this.specificUsina(id);

    if (Object.prototype.hasOwnProperty.call(updateUsinaDto, 'aceito')) {
      if (updateUsinaDto.aceito === true) {
        usinaToUpdate.data_aceite = new Date();
      } else {
        usinaToUpdate.data_aceite = null;
      }
    }

    const dataAtual = new Date();

    if (updateUsinaDto.data_aceite) {
      if (updateUsinaDto.data_aceite > dataAtual) {
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
          throw new NotFoundException('Entidade não encontrada')
      }
      usinaToUpdate.entidade = entidadeBuscada;
    }

    const usinaUpdated = await this.usinaRepository.save({
      ...usinaToUpdate,
      ...updateUsinaDto,
      entidade: usinaToUpdate.entidade,
    });

    return usinaUpdated;
  }

  async removeUsina(id: string): Promise<void> {
    await this.specificUsina(id);
    await this.usinaRepository.delete(id);
  }
}
