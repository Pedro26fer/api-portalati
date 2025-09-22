import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity('usuario')
export class User{
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ unique: false, nullable: false })
    pNome!: string

    @Column({ unique: false, nullable: false })
    uNome!: string

    @Column({ unique: false, nullable: false })
    email!: string

    @Column({nullable: false})
    password!: string

    @CreateDateColumn({type: 'timestamp'})
    createdAt!: Date

    @Column({nullable: false, type: 'timestamp'})
    ultimoAcesso!: Date

    @Column({nullable: true})
    fotoPerfil!: string

    @Column({nullable: false})
    isActive!: boolean

    constructor(){
        if(!this.id){
            this.id = uuidv4()
            this.isActive = true
            this.ultimoAcesso = new Date()
        }


    }
}