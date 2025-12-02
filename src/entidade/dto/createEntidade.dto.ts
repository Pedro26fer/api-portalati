import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntidadeDto {
  @ApiProperty({
    description: 'Nome da entidade (será convertido para maiúsculas no backend). Deve ser único.',
    example: 'USINA SOLAR ALVORADA',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  nome!: string;

  @ApiPropertyOptional({
    description: 'URL da logo da entidade. Campo opcional. Deve ser único.',
    example: 'https://minhaempresa.com/logos/logo-usina.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'A URL da logo não é válida' })
  logo?: string;

  @ApiProperty({
    description: 'Link para acesso à entidade.',
    example: 'https://portal.usina-alvorada.com',
  })
  @IsNotEmpty({ message: 'O link é obrigatório' })
  @IsUrl({}, { message: 'O link não é válido' })
  link!: string;

  @ApiPropertyOptional({
    description: 'Status da entidade. Caso não enviado, o valor padrão será "true".',
    example: true,
  })
  @IsBoolean({ message: 'O valor deve ser booleano' })
  @IsOptional()
  ativo!: boolean;
}
