import { User } from "src/user/user.entity";
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne,  } from "typeorm";
import { v4 as uuidv4} from 'uuid';

@Entity('agenda')
export class Agenda{


    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'timestamp', nullable: false})
    start: Date;

    @Column({type: 'timestamp', nullable: false})
    end: Date;

    @Column({type: 'varchar', nullable: false})
    tag: string;

    @ManyToOne(() => User, user => user.agenda, {nullable: true, onDelete: 'SET NULL'})
    tecnico: User;

    @ManyToOne(() => User, user => user.testesAbertos, {nullable: true, onDelete: 'SET NULL'})
    responsavel!: User;

    @Column({type: 'varchar', nullable: true})
    tecnicoCampo: string;

    @Column({type: 'varchar', nullable: false})
    cliente: string;

    @Column({type: 'varchar', nullable: false})
    usina: string;

    @Column({type: 'varchar', nullable: false, default: "Pendente"})
    status: string;

    @Column({type: 'varchar', nullable: true, default: ""})
    description!: string;

    @Column({type: 'varchar', nullable: false})
    equipamento: string

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;


    constructor(start: Date, end: Date, tag: string, tecnico: User, tecnicoCampo: string, cliente: string, usina: string, status: string, equipamento: string){
        this.id = uuidv4();
        this.start = start;
        this.end = end;
        this.tag = tag;
        this.tecnico = tecnico;
        this.tecnicoCampo = tecnicoCampo;
        this.cliente = cliente;
        this.usina = usina;
        this.status = status;
        this.equipamento = equipamento;
        this.created_at = new Date();
        this.updated_at = new Date();
    }

}