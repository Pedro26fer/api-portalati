import { Agenda } from 'src/agenda/agenda.entity';
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

@Entity('entidade')
export class Entidade {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  nome: string;

  @Column({ type: 'text', nullable: true, unique: true })
  logo: string;

  @Column({ type: 'varchar', nullable: false })
  link: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @OneToMany(() => Agenda, agenda => agenda.cliente)
  agenda?: Agenda[];

  @CreateDateColumn()
  criacao: Date;

  @OneToMany(() => Usina, usina => usina.entidade, { cascade: true })
  usinas?: Usina[];

  @OneToMany(() => Equipe, equipe => equipe.entidade, { cascade: true })
  equipes?: Equipe[];

  constructor(
    nome: string,
    logo: string,
    link: string,
    ativo?: boolean,
  ) {
    this.id = uuidv4();
    this.nome = nome;
    this.logo = logo;
    this.link = link;
    this.ativo = ativo ?? true;
    this.criacao = new Date();
  }
}
