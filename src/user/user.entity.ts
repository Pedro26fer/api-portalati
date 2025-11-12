import { Equipe } from 'src/equipe/equipe.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {Exclude} from 'class-transformer';
import { Agenda } from 'src/agenda/agenda.entity';
@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: false, nullable: false })
  pNome!: string;

  @Column({ unique: false, nullable: false })
  uNome!: string;

  @Column({ unique: false, nullable: false })
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

  @Column({ nullable: false })
  isActive!: boolean;

  @OneToMany(() => Agenda, (agenda) => agenda.tecnico)
  agenda!: Agenda[];

  @ManyToOne(() => Equipe, (equipe) => equipe.integrantes, { onDelete: 'CASCADE' , nullable:true})
  @JoinColumn({name: 'equipe_id'})
  equipe!: Equipe;

  @OneToOne(() => Equipe, (equipe) => equipe.supervisor, {nullable: true})
  equipe_supervisionada!: Equipe | null;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
      this.isActive = true;
      this.ultimoAcesso = new Date();
    }
  }
}
