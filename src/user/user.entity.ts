import { Equipe } from 'src/equipe/equipe.entity';
import { Agenda } from 'src/agenda/agenda.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

@Entity('usuario')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  pNome!: string;

  @Column({ nullable: false })
  uNome!: string;

  @Column({ nullable: false })
  email!: string;

  @Exclude()
  @Column({ nullable: false })
  password!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Column({ nullable: false, type: 'timestamp' })
  ultimoAcesso!: Date;

  @Column({ nullable: true })
  fotoPerfil!: string;

  @Column({ nullable: false, default: true })
  isActive!: boolean;

  @OneToMany(() => Agenda, agenda => agenda.tecnico)
  agenda?: Agenda[];

  @OneToMany(() => Agenda, agenda => agenda.responsavel)
  testesAbertos?: Agenda[];

  @ManyToOne(() => Equipe, equipe => equipe.integrantes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'equipe_id' })
  equipe?: Equipe;

  @OneToOne(() => Equipe, equipe => equipe.supervisor, {
    nullable: true,
  })
  equipe_supervisionada?: Equipe | null;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
      this.isActive = true;
      this.ultimoAcesso = new Date();
    }
  }
}
