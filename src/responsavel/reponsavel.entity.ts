import { Usina } from "src/usina/usina.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {v4 as uuidv4} from 'uuid'

@Entity('responsavel')
export class Responsavel{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({unique: true, nullable: false, type: 'varchar'})
    nome: string

    @Column({nullable: true, type: 'varchar'})
    contato: string

    @OneToMany(() => Usina, usina => usina.responsavel, {cascade: true, onDelete: 'SET NULL'})
    usinas_supervisionadas: Usina[]


    constructor(nome: string, contato: string, usinas_supervisionadas: Usina[]){
        this.id = uuidv4()
        this.nome = nome,
        this.contato = contato,
        this.usinas_supervisionadas = usinas_supervisionadas
    }
}