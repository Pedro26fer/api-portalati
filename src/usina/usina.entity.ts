import { Entidade } from 'src/entidade/entidade.entity';
import { Equipamentos } from 'src/equipamentos/equipamentos.entity';
import { Responsavel } from 'src/responsavel/reponsavel.entity';
import { Agenda } from 'src/agenda/agenda.entity';
import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('usina')
export class Usina {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, type: 'varchar', unique: true })
  nome!: string;

  @Column({ nullable: false, type: 'int' })
  skids!: number;

  @CreateDateColumn({ type: 'timestamp' })
  data_inicio!: Date;

  @Column({ type: 'timestamp', nullable: true })
  data_aceite!: Date | null;

  @Column({ nullable: false, default: false, type: 'boolean' })
  aceito!: boolean;

  @OneToMany(() => Equipamentos, equipamento => equipamento.usina)
  equipamentos?: Equipamentos[];

  @OneToMany(() => Agenda, agenda => agenda.usina)
  agendamentos?: Agenda[];

  @ManyToOne(() => Entidade, entidade => entidade.usinas, {
    nullable: false,
  })
  entidade!: Entidade;

  @ManyToOne(
    () => Responsavel,
    responsavel => responsavel.usinas_supervisionadas,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  responsavel?: Responsavel | null;

  constructor(
    nome: string,
    skids: number,
    entidade: Entidade,
    responsavel?: Responsavel,
  ) {
    if (!this.id) {
      this.id = uuidv4();
      this.nome = nome;
      this.skids = skids;
      this.entidade = entidade;
      this.responsavel = responsavel ?? null;
      this.aceito = false;
    }
  }
}
