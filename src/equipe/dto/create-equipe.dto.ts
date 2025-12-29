import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEquipeDto {

  @ApiProperty({
    description: 'Nome da equipe que será criada.',
    example: 'Equipe Norte',
  })
  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  @IsString({ message: 'O nome deve ser uma string' })
  nome!: string;

  @ApiPropertyOptional({
    description: 'Nível hierárquico da equipe. É opcional.',
    example: 2,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O nível da equipe deve ser um número' })
  nivel?: number;

  @ApiProperty({
    description: 'Nome da entidade à qual a equipe pertence.',
    example: 'ATI - Energia Solar',
  })
  @IsNotEmpty({ message: 'A entidade não pode ser vazia' })
  @IsString({ message: 'A entidade deve ser uma string' })
  entidade!: string;

  @ApiProperty({
    description: 'E-mail do supervisor responsável pela equipe.',
    example: 'joao.supervisor@empresa.com',
  })
  @IsOptional()
  @IsString({ message: 'O supervisor deve ser uma string' })
  supervisor?: string;

  @ApiPropertyOptional({
    description: 'Nome da equipe pai, caso exista hierarquia.',
    example: 'Equipe Matriz',
  })
  @IsOptional()
  @IsString({ message: 'A equipe pai deve ser uma string' })
  parent_equipe?: string;
}
