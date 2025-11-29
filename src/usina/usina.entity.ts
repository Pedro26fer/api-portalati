import { Entidade } from "src/entidade/entidade.entity";
import { Equipamentos } from "src/equipamentos/equipamentos.entity";
import { Responsavel } from "src/responsavel/reponsavel.entity";
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Entity('usina')
export class Usina {

    @ApiProperty({
        example: "f7f1e8c3-4b12-4f83-a331-2d0f24398c44",
        description: "Identificador único da usina (UUID)."
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: "Usina Solar São Pedro",
        description: "Nome único da usina."
    })
    @Column({ nullable: false, type: 'varchar', unique: true })
    nome: string;

    @ApiProperty({
        example: 12,
        description: "Quantidade de skids (estruturas) da usina."
    })
    @Column({ nullable: false, type: 'int' })
    skids: number;

    @ApiProperty({
        example: "2025-02-18T12:00:00.000Z",
        description: "Data automática de criação da usina no sistema."
    })
    @CreateDateColumn({ type: 'timestamp', nullable: false })
    data_inicio: Date;

    @ApiProperty({
        example: "2025-06-20T12:00:00.000Z",
        description: "Data em que a usina foi aceita. Pode ser nula.",
        nullable: true
    })
    @Column({ type: 'timestamp', nullable: true })
    data_aceite: Date | null;

    @ApiProperty({
        example: false,
        description: "Indica se a usina já foi aceita.",
        default: false
    })
    @Column({ nullable: false, default: false, type: 'bool' })
    aceito: boolean;

    @ApiProperty({
        type: () => [Equipamentos],
        description: "Lista de equipamentos associados à usina.",
        required: false
    })
    @OneToMany(() => Equipamentos, equipamento => equipamento.usina)
    equipamentos?: Equipamentos[];

    @ApiProperty({
        type: () => Entidade,
        description: "Entidade proprietária da usina."
    })
    @ManyToOne(() => Entidade, entidade => entidade.usinas)
    entidade: Entidade;

    @ApiProperty({
        type: () => Responsavel,
        description: "Responsável supervisionando a usina. Pode ser null.",
        nullable: true
    })
    @ManyToOne(() => Responsavel, resp => resp.usinas_supervisionadas, { nullable: true, onDelete: 'SET NULL' })
    responsavel: Responsavel;

    constructor(
        nome: string,
        data_inicio: Date,
        data_aceite: Date,
        skids: number,
        equipamentos: Equipamentos[],
        entidade: Entidade,
        responsavel: Responsavel
    ) {
        this.id = uuidv4();
        this.nome = nome;
        this.skids = skids;
        this.data_inicio = data_inicio;
        this.data_aceite = data_aceite;
        this.aceito = false;
        this.entidade = entidade;
        this.responsavel = responsavel;
    }
}
