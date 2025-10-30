import { IsArray, isArray, IsEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateResponsavelDto{


    @IsNotEmpty({message: 'Você deve fornecer o nome de um responsável'})
    @IsString({message: 'O nome do responsavel deve ser uma string'})
    nome!: string

    @IsOptional()
    @IsString({message: 'O contato deve estar em um formato de string'})
    contato?: string

    @IsArray({message: 'Você deve passar uma lista de nome das usinas supervisionadas'})
    @IsOptional()
    usinas_supervisionadas?: string[]
}