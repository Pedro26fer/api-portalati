import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateEntidadeDto } from './dto/createEntidade.dto';
import { UpdateEntidadeDto } from './dto/updateEntidade.dto';
import { Entidade } from './entidade.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EntidadeService {
  private readonly logger = new Logger(EntidadeService.name);

  constructor(
    @InjectRepository(Entidade)
    private entidadeRepository: Repository<Entidade>,
  ) {}

  async createEntidade(
    createEntidadeDto: CreateEntidadeDto,
  ): Promise<Entidade> {
    this.logger.log('Criando uma usina nova');
    const { nome, logo, link } = createEntidadeDto;

    if (!nome || !link) {
      throw new ForbiddenException('Nome e Link são campos obrigatórios');
    }

    const nomeAlredyExists = await this.entidadeRepository.findOne({
      where: { nome },
    });

    if (nomeAlredyExists) {
      this.logger.error('Nome de usina já em uso');
      throw new ForbiddenException('Já existe uma entidade com esse nome');
    }

    const logoAlredyExists = await this.entidadeRepository.findOne({
      where: { logo },
    });

    if (logoAlredyExists && logo != undefined) {
      throw new ForbiddenException('Já existe uma entidade com esse logo');
    }

    const newDataDto = {...createEntidadeDto, nome: nome.toUpperCase()}

    const newEntidade = this.entidadeRepository.create(newDataDto);
    this.logger.log('Entidade salva com sucesso');

    return await this.entidadeRepository.save(newEntidade);
  }

  async findAll(search?: string): Promise<Entidade[]> {
    this.logger.log('Listando todas as entidades');
    const qb= this.entidadeRepository
      .createQueryBuilder('entidade')
      .leftJoinAndSelect('entidade.equipes', 'equipe');

    if (search) {
      qb.andWhere('LOWER(entidade.nome) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    return qb
      .orderBy('entidade.nome', 'ASC')
      .getMany();
  }

  async findActives(): Promise<Entidade[]> {
    this.logger.log('Listando todas as entidades ativas (Informações filtradas)');
    return await this.entidadeRepository
      .createQueryBuilder('entidade')
      .select([
        'entidade.id',
        'entidade.nome',
        'entidade.link',
        'entidade.ativo',
      ])
      .where('entidade.ativo = :ativo', { ativo: true })
      .orderBy('entidade.nome', 'ASC')
      .getMany();
  }

  async findInactives(): Promise<Entidade[]> {
    this.logger.log('Listando todas as entidades ativas (Informações filtradas)');
    return await this.entidadeRepository
        .createQueryBuilder('entidade')
        .select([
          'entidade.id',
          'entidade.nome',
          'entidade.link',
          'entidade.ativo',
        ])
        .where('entidade.ativo = :ativo', { ativo: false })
        .orderBy('entidade.nome', 'ASC')
        .getMany();
  }

  async profile(id: string): Promise<Entidade> {
    this.logger.log('Busacando um entidde  em específico');
    const entidade = await this.entidadeRepository.findOne({
      where: { id },
      relations: ['equipes', 'equipes.supervisor', 'equipes.integrantes'],
    });

    if (!entidade) {
      this.logger.error('Entidade não encontrada');
      throw new NotFoundException('Entidade não encontrada');
    }

    return entidade;
  }

  async updateEntidade(
    id: string,
    updateEntidadeDto: UpdateEntidadeDto,
  ): Promise<Entidade> {
    this.logger.log('Editando entidade');   
    const entidade = await this.profile(id);

    if (updateEntidadeDto.ativo) {
      this.logger.log('Entrou na edição de status');
      entidade.ativo = updateEntidadeDto.ativo;
    }

    if (updateEntidadeDto.nome) {
      const nomeAlredyExists = await this.entidadeRepository.findOne({
        where: { nome: updateEntidadeDto.nome },
      });

      if (nomeAlredyExists) {
        this.logger.error(
          'Falha ao editar nome, ja existe uma entidade com esse nome',
        );
        throw new ForbiddenException('Já existe uma entidade com esse nome');
      }

      entidade.nome = updateEntidadeDto.nome;
    }

    if (updateEntidadeDto.logo) {
      const logoAlredyExists = await this.entidadeRepository.findOne({
        where: { logo: updateEntidadeDto.logo },
      });

      if (logoAlredyExists) {
        this.logger.error(
          'Falha ao editar a logo. Ja existe uma entidade com essa logo',
        );
        throw new ForbiddenException('Já existe uma entidade com esse logo');
      }

      entidade.logo = updateEntidadeDto.logo;
    }

    if (updateEntidadeDto.link) {
      const linkAlredyExists = await this.entidadeRepository.findOne({
        where: { link: updateEntidadeDto.link },
      });

      if (linkAlredyExists) {
        this.logger.error(
          'Erro ao editar o link da entidade. Já existe uma entidade com esse link',
        );
        throw new ForbiddenException('Já existe uma entidade com esse link');
      }

      entidade.link = updateEntidadeDto.link;
    }

    this.logger.log('Sucesso ao editar a entidade.');

    return await this.entidadeRepository.save({...entidade, ...updateEntidadeDto});
  }

  async deleteEntidade(id: string): Promise<void> {
    this.logger.log('Deletando uma entidade.');
    const entidadeToDelete = await this.profile(id);
    this.logger.log(`Sucesso ao deletar a entidade ${entidadeToDelete.nome}`);
    await this.entidadeRepository.remove(entidadeToDelete);
  }
}
