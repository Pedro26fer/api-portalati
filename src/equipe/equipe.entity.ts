import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm"
import { Entidade } from "src/entidade/entidade.entity";
import {v4 as uuidv4} from 'uuid';

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

    constructor(nome: string, entidade: Entidade, nivel?: number){
        this.id = uuidv4();
        this.nome = nome;
        this.nivel = nivel || 1;
        this.entidade = entidade;
    }
}