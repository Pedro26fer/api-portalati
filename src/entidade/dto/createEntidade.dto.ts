import { IsOptional, IsString, IsNotEmpty, IsUrl, IsBoolean } from "class-validator";

export class CreateEntidadeDto {
    
    @IsNotEmpty({message: 'O valor é obrigatório'})
    @IsString({message: 'O nome deve ser uma string'})
    nome!: string

    @IsOptional()
    @IsUrl({}, {message: 'O link não é válido'})
    logo?: string

    @IsNotEmpty()
    @IsUrl({}, {message: 'O link não é válido'})
    link!: string   

    @IsBoolean()
    @IsOptional()
    ativo!: boolean

    
}