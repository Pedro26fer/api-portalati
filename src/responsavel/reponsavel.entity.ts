import { Usina } from "src/usina/usina.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from "@nestjs/swagger";

@Entity('responsavel')
export class Responsavel {

    @ApiProperty({
        description: 'Identificador único do responsável',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Nome completo do responsável',
        example: 'João da Silva',
    })
    @Column({ unique: true, nullable: false, type: 'varchar' })
    nome: string;

    @ApiProperty({
        description: 'Informações de contato do responsável',
        example: '(11) 99999-0000',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'varchar' })
    contato: string;

    @ApiProperty({
        description: 'Lista de usinas supervisionadas pelo responsável',
        type: () => [Usina],
        required: false,
        nullable: true,
    })
    @OneToMany(() => Usina, (usina) => usina.responsavel, {
        cascade: true,
        onDelete: 'SET NULL',
    })
    usinas_supervisionadas: Usina[];

    constructor(
        nome: string,
        contato: string,
        usinas_supervisionadas: Usina[],
    ) {
        this.id = uuidv4();
        this.nome = nome;
        this.contato = contato;
        this.usinas_supervisionadas = usinas_supervisionadas;
    }
}
