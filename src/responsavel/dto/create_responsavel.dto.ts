import { 
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString 
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResponsavelDto {

  @ApiProperty({
    example: "João Souza",
    description: "Nome completo do responsável.",
  })
  @IsNotEmpty({ message: 'Você deve fornecer o nome de um responsável' })
  @IsString({ message: 'O nome do responsável deve ser uma string' })
  nome!: string;

  @ApiPropertyOptional({
    example: "(11) 99999-8888",
    description: "Contato do responsável (telefone, WhatsApp ou e-mail).",
  })
  @IsOptional()
  @IsString({ message: 'O contato deve estar em um formato de string' })
  contato?: string;

  @ApiPropertyOptional({
    example: ["USINA ARAÇARIGUAMA", "USINA CAPUAVA"],
    description: "Lista de nomes das usinas supervisionadas pelo responsável.",
    type: [String],
  })
  @IsArray({ message: 'Você deve passar uma lista de nomes das usinas supervisionadas' })
  @IsOptional()
  usinas_supervisionadas?: string[];
}
