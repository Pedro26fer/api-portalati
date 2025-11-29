import { PartialType } from '@nestjs/mapped-types';
import { CreateUsinaDto } from './create-usina.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsinaDto extends PartialType(CreateUsinaDto) {

    @ApiPropertyOptional({
        description: 'Nome da usina (opcional)',
        example: 'Usina Solar São Pedro - Atualizada'
    })
    nome?: string;

    @ApiPropertyOptional({
        description: 'Número de skids (opcional)',
        example: 15
    })
    skids?: number;

    @ApiPropertyOptional({
        description: 'Data de aceite (opcional)',
        example: '2025-04-02'
    })
    data_aceite?: Date;

    @ApiPropertyOptional({
        description: 'Status de aceite (opcional)',
        example: false
    })
    aceito?: boolean;

    @ApiPropertyOptional({
        description: 'Nome da entidade (opcional)',
        example: 'Companhia Solar Renovável'
    })
    entidade?: string;

    @ApiPropertyOptional({
        description: 'Responsável pela usina (opcional)',
        example: 'Maria Oliveira'
    })
    responsavel?: string;
}
