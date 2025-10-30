import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Responsavel } from './reponsavel.entity';
import { CreateResponsavelDto } from './dto/create_responsavel.dto';
import { Usina } from 'src/usina/usina.entity';
import { UpdateResponsavelDto } from './dto/update_responsavel.dto';

@Injectable()
export class ResponsavelService {
  private readonly logger = new Logger(ResponsavelService.name);
  constructor(
    @InjectRepository(Responsavel)
    private readonly ressponsavelRepository: Repository<Responsavel>,
    @InjectRepository(Usina)
    private readonly usinaRepository: Repository<Usina>,
  ) {}

  async createResponsavel(
    createResponsavelDto: CreateResponsavelDto,
  ): Promise<Responsavel> {
    const { nome, contato, usinas_supervisionadas } = createResponsavelDto;

    const nomeInUse = await this.ressponsavelRepository.findOne({
      where: { nome },
    });
    if (nomeInUse) {
      throw new ConflictException('O nome do responsável já está em uso');
    }

    let newResponsavel = this.ressponsavelRepository.create({ nome, contato });

    if (usinas_supervisionadas && usinas_supervisionadas.length) {
      const usinasEncontradas = await Promise.all(
        usinas_supervisionadas.map(async (nomeUsina) => {
          const usina = await this.usinaRepository.findOne({
            where: { nome: nomeUsina },
          });
          if (!usina) {
            throw new NotFoundException(`Usina ${nomeUsina} não encontrada`);
          }
          return usina;
        }),
      );
      newResponsavel.usinas_supervisionadas = usinasEncontradas;
    }

    return await this.ressponsavelRepository.save(newResponsavel);
  }

  async getAll(): Promise<Responsavel[]> {
    return await this.ressponsavelRepository.find({
      relations: ['usinas_supervisionadas'],
    });
  }

  async getResponsavelByName(nome: string): Promise<Responsavel> {
    const responsavelBuscado = await this.ressponsavelRepository.findOne({
      where: { nome },
      relations: ['usinas_supervisionadas'],
    });
    if (!responsavelBuscado) {
      throw new NotFoundException('Responsável não encontrado');
    }
    return responsavelBuscado;
  }

  async getResponsavelById(id: string): Promise<Responsavel> {
    const responsavelBuscado = await this.ressponsavelRepository.findOne({
      where: { id },
      relations: ['usinas_supervisionadas'],
    });
    if (!responsavelBuscado) {
      throw new NotFoundException('Responsável não encontrado');
    }
    return responsavelBuscado;
  }

  async removeResponsavel(id: string): Promise<void>{
    const resposavelToBeDeleted = await this.ressponsavelRepository.findOne({
      where: {id},
    })
    if (!resposavelToBeDeleted) {
      throw new NotFoundException('Responsável não encontrado');
    }
    await this.ressponsavelRepository.remove(resposavelToBeDeleted);
  }

  async updateResponsavel(id: string, updateResponsavelDTO: UpdateResponsavelDto): Promise<Responsavel>{
    const { contato, nome, usinas_supervisionadas } = updateResponsavelDTO;
    const responsavelToBeUpdated =  await this.ressponsavelRepository.findOne({
      where: {id},
      relations: ['usinas_supervisionadas']
    })
    if (!responsavelToBeUpdated) {
      throw new NotFoundException('Responsável não encontrado');
    }
    contato && (responsavelToBeUpdated.contato = contato);
    nome && (responsavelToBeUpdated.nome = nome);

    if(usinas_supervisionadas && usinas_supervisionadas.length){
      const usinasEncontradas = await Promise.all(
        usinas_supervisionadas.map(async (nomeUsina) => {
          const usina = await this.usinaRepository.findOne({
            where: { nome: nomeUsina }
          })
          if(!usina){
            throw new NotFoundException(`Usina ${nomeUsina} não encontrada`)
          }
          return usina
        })
      )
      responsavelToBeUpdated.usinas_supervisionadas = usinasEncontradas
    }
    
    return await this.ressponsavelRepository.save(responsavelToBeUpdated);  
  }
}
