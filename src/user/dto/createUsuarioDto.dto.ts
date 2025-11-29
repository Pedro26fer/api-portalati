import { IsEmail, IsString, IsUrl, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUsuarioDto {

    @ApiProperty({
        description: "Primeiro nome do usuário",
        example: "João",
    })
    @IsString()
    @IsNotEmpty({message: "O nome é obrigatório"})
    pNome!: string;

    @ApiProperty({
        description: "Último nome (sobrenome) do usuário",
        example: "Silva",
    })
    @IsString()
    @IsNotEmpty({message: "O sobrenome é obrigatório"})
    uNome!: string;

    @ApiProperty({
        description: "E-mail do usuário",
        example: "joao.silva@example.com",
    })
    @IsEmail()
    email!: string;

    @ApiPropertyOptional({
        description: "Indica se o usuário está ativo",
        example: true,
    })
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        description: "Senha do usuário (mínimo de 6 caracteres)",
        example: "minhasenha123",
    })
    @IsString()
    @MinLength(6, {message: 'A senha deve ter no mínimo 6 caracteres'})
    password!: string;

    @ApiPropertyOptional({
        description: "URL da foto de perfil do usuário",
        example: "https://meusite.com/fotos/usuario.png",
    })
    @IsString()
    @IsUrl(undefined, {message: "A foto de perfil deve ser uma URL válida"})
    @IsOptional()
    fotoPerfil?: string;

    @ApiPropertyOptional({
        description: "Nome da equipe à qual o usuário pertence (string)",
        example: "Equipe Norte",
    })
    @IsOptional()
    @IsString({message: 'As equipes devem ser uma string'})
    equipe?: string;
}
