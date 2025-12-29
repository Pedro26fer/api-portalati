import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/user.entity';
import { Usina } from 'src/usina/usina.entity';
import { Entidade } from 'src/entidade/entidade.entity';
import { Equipamentos } from 'src/equipamentos/equipamentos.entity';

@Entity('agenda')
export class Agenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  start: Date;

  @Column({ type: 'timestamp' })
  end: Date;

  @Column({ type: 'varchar' })
  tag: string;

  @ManyToOne(() => User, user => user.agenda, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  tecnico!: User;

  @ManyToOne(() => User, user => user.testesAbertos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  responsavel?: User;

  @Column({ type: 'varchar', nullable: true })
  tecnicoCampo: string;

  @ManyToOne(() => Entidade, entidade => entidade.agenda, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  cliente!: Entidade;

  @ManyToOne(() => Usina, usina => usina.agendamentos, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  usina!: Usina;

  @Column({ type: 'varchar', default: 'Pendente' })
  status!: string;

  @Column({ type: 'varchar', nullable: true, default: '' })
  description?: string;

  @ManyToMany(() => Equipamentos, equipamento => equipamento.agendamentos, {
    nullable: false,
  })
  @JoinTable({
    name: 'agenda_equipamentos',
  })
  equipamentos!: Equipamentos[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
  constructor(start: Date, end: Date, tag: string, tecnicoCampo: string, cliente: Entidade, equipamentos: Equipamentos[]) {
    this.id = uuidv4(),
    this.start = start;
    this.end = end;
    this.tag = tag;
    this.tecnicoCampo = tecnicoCampo;
    this.cliente = cliente;
    this.equipamentos = equipamentos;
  }

}
