import { IsString, IsOptional, IsNumber, IsDate, IsBoolean, IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUsinaDto {

    @ApiProperty({
        description: 'Nome da usina',
        example: 'Usina Solar São Pedro'
    })
    @IsString({ message: 'O nome da usina deve ser uma string' })
    nome: string;

    @ApiProperty({
        description: 'Número de skids da usina',
        example: 12
    })
    @IsNumber({ maxDecimalPlaces: 0 })
    skids: number;

    @ApiPropertyOptional({
        description: 'Data de aceite da usina',
        example: '2025-03-15',
    })
    @IsDate({ message: 'O campo deve ser uma data' })
    @IsOptional()
    data_aceite?: Date;

    @ApiPropertyOptional({
        description: 'Indica se a usina já foi aceita',
        example: true
    })
    @IsBoolean({ message: "O aceite deve ser um booleano" })
    @IsOptional()
    aceito?: boolean;

    @ApiProperty({
        description: 'Nome da entidade proprietária da usina',
        example: 'Energias do Brasil'
    })
    @IsString({ message: 'O nome da entidade deve ser uma string' })
    entidade: string;

    @ApiProperty({
        description: 'Nome do responsável pela usina',
        example: 'João da Silva'
    })
    @IsNotEmpty({ message: 'Favor informar o responsável pela usina' })
    @IsString({ message: 'O nome do responsável pela usina deve ser uma string' })
    responsavel: string;

    constructor(
        nome: string,
        skids: number,
        entidade: string,
        responsavel: string,
        data_aceite?: Date,
        aceito?: boolean,
    ) {
        this.nome = nome;
        this.skids = skids;
        this.data_aceite = data_aceite;
        this.aceito = aceito;
        this.entidade = entidade;
        this.responsavel = responsavel;
    }
}
