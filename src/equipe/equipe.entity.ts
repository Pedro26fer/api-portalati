import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn } from "typeorm"
import { Entidade } from "src/entidade/entidade.entity";
import {v4 as uuidv4} from 'uuid';
import { User } from "src/user/user.entity";
import { Expose, Exclude } from "class-transformer";

@Entity('equipe')
export class Equipe {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    nome: string;

    @Column()
    nivel: number;

    @ManyToOne(() => Entidade, (entidade) => entidade.equipes,)
    entidade: Entidade;

    @OneToMany(() => User, (user) => user.equipe, {cascade: true})
    integrantes!: User[];

    @OneToOne(() => User, (supervisor) => supervisor.equipe_supervisionada)
    @JoinColumn({name: 'supervisor_id'})
    supervisor!: User;

    @Expose()
    @OneToMany(() => Equipe, equipe => equipe.parent_equipe, {nullable: true})
    sub_equipes!: Equipe[];

    @Expose()
    @ManyToOne(() => Equipe, equipe => equipe.sub_equipes, {nullable: true})
    @JoinColumn({name: 'equipe_pai'})
    parent_equipe!: Equipe;

    constructor(nome: string, entidade: Entidade, nivel?: number){
        this.id = uuidv4();
        this.nome = nome;
        this.nivel = nivel || 1;
        this.entidade = entidade;
    }
}