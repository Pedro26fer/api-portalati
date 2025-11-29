import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUsuarioDto } from './createUsuarioDto.dto';

export class UpdateUserDTO extends PartialType(CreateUsuarioDto) {

    @ApiPropertyOptional({
        description: "Primeiro nome do usuário",
        example: "João"
    })
    pNome?: string;

    @ApiPropertyOptional({
        description: "Sobrenome do usuário",
        example: "Silva"
    })
    uNome?: string;

    @ApiPropertyOptional({
        description: "E-mail do usuário",
        example: "joao.silva@example.com"
    })
    email?: string;

    @ApiPropertyOptional({
        description: "Indica se o usuário está ativo",
        example: true,
    })
    isActive?: boolean;

    @ApiPropertyOptional({
        description: "Senha do usuário (mínimo 6 caracteres)",
        example: "novasenha123",
    })
    password?: string;

    @ApiPropertyOptional({
        description: "URL da foto de perfil",
        example: "https://site.com/imagens/perfil.png",
    })
    fotoPerfil?: string;

    @ApiPropertyOptional({
        description: "Nome da equipe à qual o usuário pertence",
        example: "Equipe Norte",
    })
    equipe?: string;
}
