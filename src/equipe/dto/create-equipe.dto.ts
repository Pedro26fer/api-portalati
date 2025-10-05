import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEquipeDto{
    
    @IsNotEmpty({message: 'O nome não pode ser vazio'})
    @IsString({message: 'O nome deve ser uma string'})
    nome!: string;

    @IsOptional()
    @IsNumber({}, {message: 'O nível da equipe deve ser um número'})
    nivel?: number;

    @IsNotEmpty({message: 'A entidade não pode ser vazia'})
    @IsString({message: 'A entidade deve ser uma string'})
    entidade!: string;

    @IsNotEmpty({message: 'O supervisor não pode ser vazio'})
    @IsString({message: 'O supervisor deve ser uma string'})
    supervisor!: string;

}