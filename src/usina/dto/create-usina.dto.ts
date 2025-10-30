import { IsString, IsOptional, IsNumber, IsDate, IsBoolean, IsNotEmpty } from "class-validator";

export class CreateUsinaDto {

    @IsString({ message: 'O nome da usina deve ser uma string' })
    nome: string;

    @IsNumber({maxDecimalPlaces: 0})
    skids: number

    @IsDate({message: 'O campo deve ser uma data'})
    @IsOptional()
    data_aceite?: Date

    @IsBoolean({message: "O aceite deve ser um booleano"})
    @IsOptional()
    aceito?: boolean


    @IsString({ message: 'O nome da entidade deve ser uma string' })
    entidade: string;


    @IsNotEmpty({message: 'Favor informar o responsável pela usina'})
    @IsString({message: 'O nome do responsável pela usina deve ser uma string'})
    responsavel: string

    constructor(
        nome: string,
        skids: number,
        entidade: string,
        responsavel: string,
        data_aceite?: Date,
        aceito?: boolean,
    ){
        this.nome  = nome
        this.skids = skids
        this.data_aceite = data_aceite
        this.aceito = aceito
        this.entidade = entidade
        this.responsavel = responsavel
    }   
}

