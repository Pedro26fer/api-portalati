import { Usina } from "src/usina/usina.entity";
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Column,
  PrimaryGeneratedColumn,
} from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Entity('equipamentos')
export class Equipamentos {

  @ApiProperty({
    description: 'ID único do equipamento',
    example: 'a3b8f9e2-1c4d-4e8f-b922-56e73f5a92d3'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome do equipamento',
    example: 'Inversor Sungrow SG110CX'
  })
  @Column({ nullable: false, type: 'varchar' })
  nome: string;

  @ApiProperty({
    description: 'Apelido do equipamento',
    example: 'Inversor 01',
    required: false
  })
  @Column({ nullable: true, type: 'varchar' })
  apelido: string;

  @ApiProperty({
    description: 'Descrição detalhada do equipamento',
    example: 'Inversor responsável pelo MPPT 1 ao 3.'
  })
  @Column({ nullable: false, type: 'varchar' })
  descricao: string;

  @ApiProperty({
    description: 'Número de série do equipamento',
    example: 1234567890123
  })
  @Column({ nullable: false, type: 'bigint', unique: true })
  numSerie: number;

  @ApiProperty({
    description: 'Versão do firmware do equipamento',
    example: 'v3.2.17'
  })
  @Column({ nullable: false, type: 'varchar' })
  versao: string;

  @ApiProperty({
    description: 'Endereço IP configurado no equipamento',
    example: '192.168.100.20'
  })
  @Column({ nullable: false, type: 'varchar' })
  ipLocal: string;

  @ApiProperty({
    description: 'Quantidade de portas disponíveis no equipamento',
    example: 2,
    required: false,
    default: 2
  })
  @Column({ nullable: false, type: 'int', default: 2 })
  portasDisponiveis?: number;

  @ApiProperty({
    description: 'Usina na qual o equipamento está alocado',
    type: () => Usina
  })
  @ManyToOne(() => Usina, (usina) => usina.equipamentos)
  usina: Usina;

  @ApiProperty({
    description: 'Equipamento pai (no caso de equipamentos encadeados)',
    required: false,
    type: () => Equipamentos
  })
  @ManyToOne(() => Equipamentos, (equipamento) => equipamento.filhos, { nullable: true, cascade:true })
  @JoinColumn({ name: 'equipamento_pai' })
  pai?: Equipamentos;

  @ApiProperty({
    description: 'Lista de equipamentos filhos',
    required: false,
    type: () => [Equipamentos]
  })
  @OneToMany(() => Equipamentos, (equipamento) => equipamento.pai)
  filhos?: Equipamentos[];

  constructor(
    nome: string,
    apelido: string,
    descricao: string,
    numSerie: number,
    portasDisponiveis: number,
    versao: string,
    ipLocal: string,
    usina: Usina
  ) {
    this.id = uuidv4();
    this.nome = nome;
    this.apelido = apelido!;
    this.descricao = descricao;
    this.numSerie = numSerie;
    this.versao = versao;
    this.ipLocal = ipLocal;
    this.usina = usina;
    this.portasDisponiveis = portasDisponiveis;
  }
}
