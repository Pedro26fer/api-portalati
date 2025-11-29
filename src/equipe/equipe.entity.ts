import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Entidade } from 'src/entidade/entidade.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/user.entity';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('equipe')
export class Equipe {
  @ApiProperty({
    description: 'Identificador único da equipe',
    example: 'c0f1ef05-b82e-4e2a-81ad-4b02b5ab7d55',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome único da equipe',
    example: 'Equipe de Suporte N1',
  })
  @Column({ unique: true })
  nome: string;

  @ApiProperty({
    description: 'Nível da equipe (ex.: N1, N2, N3)',
    example: 1,
  })
  @Column()
  nivel: number;

  @ApiProperty({
    description: 'Entidade à qual a equipe pertence',
    type: () => Entidade,
  })
  @ManyToOne(() => Entidade, (entidade) => entidade.equipes, {
    onDelete: 'CASCADE',
  })
  entidade: Entidade;

  @ApiProperty({
    description: 'Usuários que fazem parte da equipe',
    type: () => [User],
    required: false,
  })
  @OneToMany(() => User, (user) => user.equipe, { cascade: true })
  integrantes!: User[];

  @ApiProperty({
    description: 'Supervisor da equipe',
    type: () => User,
    nullable: true,
    required: false,
  })
  @OneToOne(() => User, (supervisor) => supervisor.equipe_supervisionada, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor!: User;

  @ApiProperty({
    description:
      'Lista de equipes subordinadas (sub-equipes hierárquicas desta equipe)',
    type: () => [Equipe],
    required: false,
    nullable: true,
  })
  @Expose()
  @OneToMany(() => Equipe, (equipe) => equipe.parent_equipe, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  sub_equipes!: Equipe[];

  @ApiProperty({
    description: 'Equipe pai (caso esta equipe seja subordinada a outra)',
    type: () => Equipe,
    nullable: true,
    required: false,
  })
  @Expose()
  @ManyToOne(() => Equipe, (equipe) => equipe.sub_equipes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'equipe_pai' })
  parent_equipe!: Equipe;

  constructor(nome: string, entidade: Entidade, nivel?: number) {
    this.id = uuidv4();
    this.nome = nome;
    this.nivel = nivel || 1;
    this.entidade = entidade;
  }
}
