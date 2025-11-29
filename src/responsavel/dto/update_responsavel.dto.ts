import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateResponsavelDto } from './create_responsavel.dto';

export class UpdateResponsavelDto extends PartialType(CreateResponsavelDto) {

  @ApiPropertyOptional({
    description: "Nome atualizado do responsável.",
    example: "Carlos Andrade"
  })
  nome?: string;

  @ApiPropertyOptional({
    description: "Contato atualizado do responsável.",
    example: "(11) 98888-7777"
  })
  contato?: string;

  @ApiPropertyOptional({
    description: "Lista atualizada de usinas supervisionadas.",
    example: ["USINA NOVA LIMEIRA", "USINA ARAÇARIGUAMA"],
    type: [String]
  })
  usinas_supervisionadas?: string[];

}
