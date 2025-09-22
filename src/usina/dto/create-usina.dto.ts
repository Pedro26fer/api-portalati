import { IsString, IsOptional, IsNumber, IsDate, IsBoolean } from "class-validator";

export class CreateUsinaDto {

    @IsString({ message: 'O nome da usina deve ser uma string' })
    nome: string;

    @IsNumber({maxDecimalPlaces: 0})
    skids: number

    @IsDate({message: 'O campo deve ser uma data'})
    @IsDate({message: 'O campo deve ser um objeto tipo Date'})
    @IsOptional()
    data_aceite?: Date

    @IsBoolean({message: "O aceite deve ser um booleano"})
    @IsOptional()
    aceito?: boolean

    constructor(nome: string, skids: number, data_aceite?: Date, aceito?: boolean){
        this.nome  = nome
        this.skids = skids
        this.data_aceite = data_aceite
        this.aceito = aceito
    }

}

