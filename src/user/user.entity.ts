import { ApiProperty } from '@nestjs/swagger';
import { Equipe } from 'src/equipe/equipe.entity';
import { Agenda } from 'src/agenda/agenda.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

@Entity('usuario')
export class User {
  @ApiProperty({
    description: 'Identificador único do usuário (UUID)',
    example: '1c2b7a14-9d3e-4a63-9d0c-9dc1efef1234',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'João',
  })
  @Column({ unique: false, nullable: false })
  pNome!: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Silva',
  })
  @Column({ unique: false, nullable: false })
  uNome!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  @Column({ unique: false, nullable: false })
  email!: string;

  @ApiProperty({
    description:
      'Senha do usuário (não aparece no retorno por estar com Exclude)',
    example: '******',
  })
  @Exclude()
  @Column({ nullable: false })
  password!: string;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2025-02-10T12:30:22.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Data do último acesso do usuário',
    example: '2025-02-15T08:43:10.000Z',
  })
  @Column({ nullable: false, type: 'timestamp' })
  ultimoAcesso!: Date;

  @ApiProperty({
    description: 'URL da foto de perfil',
    example: 'https://example.com/foto.jpg',
    required: false,
  })
  @Column({ nullable: true })
  fotoPerfil!: string;

  @ApiProperty({
    description: 'Indica se o usuário está ativo',
    example: true,
  })
  @Column({ nullable: false })
  isActive!: boolean;

  @ApiProperty({
    description: 'Agendamentos onde o usuário atua como técnico',
    type: () => [Agenda],
    required: false,
  })
  @OneToMany(() => Agenda, (agenda) => agenda.tecnico)
  agenda!: Agenda[];

  @ApiProperty({
    description: 'Testes que o usuário abriu como responsável',
    type: () => [Agenda],
    required: false,
  })
  @OneToMany(() => Agenda, (agenda) => agenda.responsavel)
  testesAbertos!: Agenda[];

  @ApiProperty({
    description: 'Equipe à qual o usuário pertence',
    type: () => Equipe,
    required: false,
  })
  @ManyToOne(() => Equipe, (equipe) => equipe.integrantes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'equipe_id' })
  equipe!: Equipe;

  @ApiProperty({
    description: 'Equipe supervisionada pelo usuário (se for supervisor)',
    type: () => Equipe,
    required: false,
  })
  @OneToOne(() => Equipe, (equipe) => equipe.supervisor, { nullable: true })
  equipe_supervisionada!: Equipe | null;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
      this.isActive = true;
      this.ultimoAcesso = new Date();
    }
  }
}
