import { Equipe } from 'src/equipe/equipe.entity';
import { Usina } from 'src/usina/usina.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Entity('entidade')
export class Entidade {
  @ApiProperty({
    description: 'ID único da entidade',
    example: 'c8d12a19-7f34-4dd0-9ac1-56c88476f2b3',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome da entidade',
    example: 'SolarTech Brasil',
  })
  @Column({ type: 'varchar', nullable: false, unique: true })
  nome: string;

  @ApiProperty({
    description: 'Logo da entidade (URL ou Base64)',
    required: false,
    example: 'https://meusistema.com/logos/solartech.png',
  })
  @Column({ type: 'text', nullable: true, unique: true })
  logo: string;

  @ApiProperty({
    description: 'Link de acesso ao painel da entidade',
    example: 'https://solartech.com.br/dashboard',
  })
  @Column({ type: 'varchar', nullable: false })
  link: string;

  @ApiProperty({
    description: 'Indica se a entidade está ativa',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  ativo!: boolean | true;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-01-18T14:35:22.000Z',
  })
  @CreateDateColumn()
  criacao: Date;

  @ApiProperty({
    description: 'Lista de usinas vinculadas à entidade',
    type: () => [Usina],
    required: false,
  })
  @OneToMany(() => Usina, (usina) => usina.entidade, { cascade: true })
  usinas!: Usina[];

  @ApiProperty({
    description: 'Lista de equipes vinculadas à entidade',
    type: () => [Equipe],
    required: false,
  })
  @OneToMany(() => Equipe, (equipe) => equipe.entidade, { cascade: true })
  equipes!: Equipe[];

  constructor(
    nome: string,
    logo: string,
    link: string,
    ativo?: boolean,
    usinas?: Usina[] | [],
    equipes?: Equipe[] | [],
  ) {
    this.id = uuidv4();
    this.nome = nome;
    this.logo = logo;
    this.link = link;
    this.ativo = ativo ?? true;
    this.criacao = new Date();
  }
}
