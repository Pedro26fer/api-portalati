import { BadRequestException, Inject } from '@nestjs/common';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEquipamentoDto } from './dto/createEquipamento.dto';
import { UpdateEquipamentoDto } from './dto/updateEquipamento.dto';
import { Usina } from 'src/usina/usina.entity';
import { Equipamentos } from './equipamentos.entity';
import { create } from 'domain';

@Injectable()
export class EquipamentoService {
  constructor(
    @InjectRepository(Equipamentos)
    private readonly equipamentosRepository: Repository<Equipamentos>,
    @InjectRepository(Usina)
    private readonly usinaRepository: Repository<Usina>,
  ) {}

  async verificarNumeroDeFilhos(
    numeroDePortas: number,
    numeroDeFilhos: number,
  ): Promise<boolean> {
    return numeroDeFilhos < numeroDePortas;
  }

  async createEquipamento(
    createEquioamentoDto: CreateEquipamentoDto,
  ): Promise<Equipamentos> {
    const usina = await this.usinaRepository.findOne({
      where: { nome: createEquioamentoDto.usina },
    });
    if (!usina) {
      throw new NotFoundException(
        `Usina com nome ${createEquioamentoDto.usina} não encontrada.`,
      );
    }

    if (
      createEquioamentoDto.nome.toLowerCase().includes('gateway') ||
      createEquioamentoDto.nome.toLowerCase().includes('medbox')
    ) {
      createEquioamentoDto.portasDisponiveis = 2;
    }

    const numeroDeSerieExistente = await this.equipamentosRepository.findOne({
      where: { numSerie: createEquioamentoDto.numSerie },
    });
    if (numeroDeSerieExistente) {
      throw new ForbiddenException(
        `Número de série ${createEquioamentoDto.numSerie} já está em uso.`,
      );
    }

    const numeroIPexistenteNaUsina = await this.equipamentosRepository.findOne({
      where: { ipLocal: createEquioamentoDto.ipLocal, usina: { id: usina.id } },
    });
    if (numeroIPexistenteNaUsina) {
      throw new ForbiddenException(
        `O IP local ${createEquioamentoDto.ipLocal} já está em uso nesta usina.`,
      );
    }
    const novoEquipamento = new Equipamentos(
      createEquioamentoDto.nome,
      createEquioamentoDto.apelido!,
      createEquioamentoDto.descricao,
      createEquioamentoDto.numSerie,
      createEquioamentoDto.portasDisponiveis!,
      createEquioamentoDto.versao,
      createEquioamentoDto.ipLocal,
      usina,
    );

    if (createEquioamentoDto.equipamento_pai) {
      const equipamentoPai = await this.equipamentosRepository.findOne({
        where: { numSerie: createEquioamentoDto.equipamento_pai },
        relations: ['filhos'],
      });

      if (!equipamentoPai) {
        throw new NotFoundException(
          `Equipamento pai com número de série ${createEquioamentoDto.equipamento_pai} não encontrado.`,
        );
      }

      this.verificarNumeroDeFilhos(
        createEquioamentoDto.portasDisponiveis!,
        equipamentoPai.filhos ? equipamentoPai.filhos.length : 0,
      );

      novoEquipamento.pai = equipamentoPai;
    }

    const equipamentoCriado =
      await this.equipamentosRepository.save(novoEquipamento);
    return equipamentoCriado;
  }

  async findAll(): Promise<Equipamentos[]> {
    return await this.equipamentosRepository.find({
      relations: ['usina', 'pai', 'filhos'],
    });
  }

  async getEquipamentoById(id: string): Promise<Equipamentos> {
    const equipamento = await this.equipamentosRepository.findOne({
      where: { id },
      relations: ['usina', 'pai', 'filhos'],
    });
    if (!equipamento) {
      throw new NotFoundException(`Equipamento com ID ${id} não encontrado.`);
    }
    return equipamento;
  }

  async updateEquipamento(
    id: string,
    updateEquipamentoDto: UpdateEquipamentoDto,
  ): Promise<Equipamentos> {
    const equipamentoToEdit = await this.equipamentosRepository.findOne({
      where: { id },
      relations: ['pai', 'filhos', 'usina'],
    });

    if (!equipamentoToEdit) {
      throw new NotFoundException(`Equipamento com ID ${id} não encontrado.`);
    }

    // Verifica se o número de série já existe em outro equipamento
    if (
      updateEquipamentoDto.numSerie &&
      updateEquipamentoDto.numSerie !== equipamentoToEdit.numSerie
    ) {
      const numeroDeSerieExistente = await this.equipamentosRepository.findOne({
        where: { numSerie: updateEquipamentoDto.numSerie },
      });

      if (numeroDeSerieExistente) {
        throw new ForbiddenException(
          `Número de série ${updateEquipamentoDto.numSerie} já está em uso.`,
        );
      }
    }

    // Verifica se o IP local já existe na mesma usina
    if (
      updateEquipamentoDto.ipLocal &&
      updateEquipamentoDto.ipLocal !== equipamentoToEdit.ipLocal
    ) {
      const ipExistenteNaUsina = await this.equipamentosRepository.findOne({
        where: {
          ipLocal: updateEquipamentoDto.ipLocal,
          usina: { id: equipamentoToEdit.usina.id },
        },
      });

      if (ipExistenteNaUsina) {
        throw new ForbiddenException(
          `O IP local ${updateEquipamentoDto.ipLocal} já está em uso nesta usina.`,
        );
      }
    }

    // Se o equipamento pai foi alterado
    if (
      updateEquipamentoDto.equipamento_pai &&
      updateEquipamentoDto.equipamento_pai !== equipamentoToEdit.pai?.numSerie
    ) {
      const novoPai = await this.equipamentosRepository.findOne({
        where: { numSerie: updateEquipamentoDto.equipamento_pai },
        relations: ['filhos'],
      });

      if (!novoPai) {
        throw new NotFoundException(
          `Equipamento pai com número de série ${updateEquipamentoDto.equipamento_pai} não encontrado.`,
        );
      }

      // Verifica se o novo pai tem capacidade para receber todos os filhos do atual
      const totalDeFilhos =
        (novoPai.filhos?.length || 0) + (equipamentoToEdit.filhos?.length || 0);

      if (totalDeFilhos > novoPai.portasDisponiveis!) {
        throw new BadRequestException(
          `O novo pai (${novoPai.nome}) não possui portas suficientes para receber todos os filhos do equipamento atual.`,
        );
      }

      if (equipamentoToEdit.filhos && equipamentoToEdit.filhos.length > 0) {
        for (const filho of equipamentoToEdit.filhos) {
          filho.pai = novoPai;
          await this.equipamentosRepository.save(filho);
        }
      }

      equipamentoToEdit.pai = novoPai;
    }
    Object.assign(equipamentoToEdit, updateEquipamentoDto);

    const equipamentoAtualizado =
      await this.equipamentosRepository.save(equipamentoToEdit);

    return equipamentoAtualizado;
  }

  async deleteEquipamento(id: string): Promise<void>{
    const equipamentoToBeDeleted = await this.getEquipamentoById(id);
    await this.equipamentosRepository.remove(equipamentoToBeDeleted);
  }

}
