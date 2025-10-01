import { Equipe } from "src/equipe/equipe.entity";
import { Usina } from "src/usina/usina.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, JoinColumn, JoinTable } from "typeorm";
import {v4 as uuidv4} from 'uuid'

@Entity('entidade')
export class Entidade {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'varchar', nullable: false, unique: true})
    nome: string

    @Column({type: 'text', nullable: true, unique: true})
    logo: string

    @Column({type: 'varchar', nullable: false, unique: true})
    link: string

    @Column({type: 'boolean', default: true})
    ativo: boolean

    @CreateDateColumn()
    criacao: Date

    @OneToMany(() => Usina, usina => usina.entidade, {cascade: true})
    usinas!: Usina[];

    @OneToMany(() => Equipe, equipe => equipe.entidade, {cascade: true})
    equipes!: Equipe[];



    constructor(nome: string, logo: string, link: string, usinas?: Usina[] | [], equipes?: Equipe[] | []){
        this.id = uuidv4()
        this.nome = nome
        this.logo = logo
        this.link = link
        this.ativo = true
        this.criacao = new Date()
    }
}