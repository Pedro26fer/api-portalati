import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipeDto } from './create-equipe.dto';

export class UpdateEquipeDto extends PartialType(CreateEquipeDto) {
  
  @ApiPropertyOptional({
    description: 'Nome da equipe. Campo opcional durante a atualização.',
    example: 'Equipe Norte Revisada',
  })
  nome?: string;

  @ApiPropertyOptional({
    description: 'Nível hierárquico da equipe. Campo opcional.',
    example: 3,
  })
  nivel?: number;

  @ApiPropertyOptional({
    description: 'Nome da entidade vinculada à equipe.',
    example: 'ATI - Energia Solar',
  })
  entidade?: string;

  @ApiPropertyOptional({
    description: 'Supervisor responsável pela equipe (e-mail ou identificador).',
    example: 'novo.supervisor@empresa.com',
  })
  supervisor?: string;

  @ApiPropertyOptional({
    description: 'Equipe pai na hierarquia, caso exista.',
    example: 'Equipe Matriz',
  })
  parent_equipe?: string;
}
