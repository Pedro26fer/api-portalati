import { Agenda } from 'src/agenda/agenda.entity';
import { Usina } from 'src/usina/usina.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('equipamentos')
export class Equipamentos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  nome: string;

  @Column({ nullable: true, type: 'varchar' })
  apelido: string;

  @Column({ nullable: false, type: 'varchar' })
  descricao: string;

  @Column({ nullable: false, type: 'bigint', unique: true })
  numSerie: number;

  @Column({ nullable: false, type: 'varchar' })
  versao: string;

  @Column({ nullable: false, type: 'varchar' })
  ipLocal: string;

  @Column({ nullable: false, type: 'int', default: 2 })
  portasDisponiveis?: number;

  @ManyToOne(() => Usina, (usina) => usina.equipamentos)
  usina: Usina;

  @ManyToOne(() => Equipamentos, (equipamento) => equipamento.filhos, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: 'equipamento_pai' })
  pai?: Equipamentos;

  @OneToMany(() => Equipamentos, (equipamento) => equipamento.pai)
  filhos?: Equipamentos[];

  @ManyToMany(() => Agenda, (agenda) => agenda.equipamentos)
  agendamentos?: Agenda[];

  constructor(
    nome: string,
    apelido: string,
    descricao: string,
    numSerie: number,
    portasDisponiveis: number,
    versao: string,
    ipLocal: string,
    usina: Usina,
  ) {
    this.id = uuidv4();
    this.nome = nome;
    this.apelido = apelido;
    this.descricao = descricao;
    this.numSerie = numSerie;
    this.versao = versao;
    this.ipLocal = ipLocal;
    this.usina = usina;
    this.portasDisponiveis = portasDisponiveis;
  }
}
