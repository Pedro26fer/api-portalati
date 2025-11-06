import { Entidade } from "src/entidade/entidade.entity";
import { Equipamentos } from "src/equipamentos/equipamentos.entity";
import { Equipe } from "src/equipe/equipe.entity";
import { Responsavel } from "src/responsavel/reponsavel.entity";
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity('usina')
export class Usina{

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false, type: 'varchar', unique: true })
    nome: string;
 
    @Column({nullable: false, type: 'int'})
    skids: number;

    @CreateDateColumn({type: 'timestamp', nullable: false})
    data_inicio: Date;


    @Column({type: 'timestamp', nullable: true, })
    data_aceite: Date | null


    @Column({nullable: false, default: false, type: 'bool',})
    aceito: boolean 

    @OneToMany(() => Equipamentos, equipamento => equipamento.usina)
    equipamentos?: Equipamentos[];

    @ManyToOne(() => Entidade, entidade => entidade.usinas)
    entidade: Entidade;

    @ManyToOne(() => Responsavel, resp => resp.usinas_supervisionadas, {nullable: true, onDelete: 'SET NULL'})
    responsavel: Responsavel


    constructor(nome: string, data_inicio: Date, data_aceite: Date, skids: number, equipamentos: Equipamentos[], entidade: Entidade, responsavel: Responsavel){
        this.id = uuidv4()
        this.nome = nome
        this.skids = skids
        this.data_inicio = data_inicio
        this.data_aceite = data_aceite
        this.aceito = false
        this.entidade = entidade,
        this.responsavel = responsavel
        
    }
}