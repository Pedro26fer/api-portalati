import { User } from "src/user/user.entity";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Entity('agenda')
export class Agenda {

  @ApiProperty({
    description: 'ID único do agendamento',
    example: 'b13e9df2-543c-4950-9fbd-bc220bd8bf91'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Data e hora inicial do agendamento',
    example: '2025-11-29T14:00:00.000Z'
  })
  @Column({ type: 'timestamp', nullable: false })
  start: Date;

  @ApiProperty({
    description: 'Data e hora final do agendamento',
    example: '2025-11-29T16:00:00.000Z'
  })
  @Column({ type: 'timestamp', nullable: false })
  end: Date;

  @ApiProperty({
    description: 'Tag identificadora do tipo de agendamento',
    example: 'Instalação'
  })
  @Column({ type: 'varchar', nullable: false })
  tag: string;

  @ApiProperty({
    description: 'Técnico que realizará o agendamento',
    type: () => User,
    required: false
  })
  @ManyToOne(() => User, user => user.agenda, { nullable: true, onDelete: 'SET NULL' })
  tecnico: User;

  @ApiProperty({
    description: 'Responsável pela abertura do agendamento',
    type: () => User,
    required: false
  })
  @ManyToOne(() => User, user => user.testesAbertos, { nullable: true, onDelete: 'SET NULL' })
  responsavel!: User;

  @ApiProperty({
    description: 'Nome do técnico de campo (caso exista)',
    example: 'Carlos Pereira',
    required: false
  })
  @Column({ type: 'varchar', nullable: true })
  tecnicoCampo: string;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'Fazenda São Pedro'
  })
  @Column({ type: 'varchar', nullable: false })
  cliente: string;

  @ApiProperty({
    description: 'Nome da usina',
    example: 'USINA SP-120'
  })
  @Column({ type: 'varchar', nullable: false })
  usina: string;

  @ApiProperty({
    description: 'Status atual do agendamento',
    example: 'Pendente',
    default: 'Pendente'
  })
  @Column({ type: 'varchar', nullable: false, default: "Pendente" })
  status: string;

  @ApiProperty({
    description: 'Descrição adicional do agendamento',
    example: 'Cliente solicitou revisão completa.',
    required: false
  })
  @Column({ type: 'varchar', nullable: true, default: "" })
  description!: string;

  @ApiProperty({
    description: 'Nome ou identificação do equipamento configurado',
    example: 'Controlador XG-500'
  })
  @Column({ type: 'varchar', nullable: false })
  equipamento: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-11-28T17:32:10.000Z'
  })
  @CreateDateColumn()
  created_at!: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2025-11-28T17:45:00.000Z'
  })
  @UpdateDateColumn()
  updated_at!: Date;

  constructor(
    start: Date,
    end: Date,
    tag: string,
    tecnico: User,
    tecnicoCampo: string,
    cliente: string,
    usina: string,
    status: string,
    equipamento: string
  ) {
    this.id = uuidv4();
    this.start = start;
    this.end = end;
    this.tag = tag;
    this.tecnico = tecnico;
    this.tecnicoCampo = tecnicoCampo;
    this.cliente = cliente;
    this.usina = usina;
    this.status = status;
    this.equipamento = equipamento;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

}
