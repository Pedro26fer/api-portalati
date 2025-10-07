import { IsEmail, IsString, IsUrl, IsNotEmpty, IsOptional, MinLength, IsArray } from "class-validator";
import { Equipe } from "src/equipe/equipe.entity";

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty({message: "O nome é obrigatório"})
    pNome!: string;

    @IsString()
    @IsNotEmpty({message: "O sobrenome é obrigatório"})
    uNome!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    isActive?: boolean;

    @IsString()
    @MinLength(6, {message: 'A senha deve ter no mínimo 6 caracteres'})
    password!: string;

    @IsString()
    @IsUrl(undefined, {message: "A foto de perfil deve ser uma URL válida"})
    @IsOptional()
    fotoPerfil?: string

    @IsOptional()
    @IsString({message: 'As equipes devem ser uma string'})
    equipe?: string 
}