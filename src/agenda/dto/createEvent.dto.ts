import { IsString, IsOptional, IsEmail, IsArray } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEventDto {

    @ApiProperty({
        description: 'Data e hora de início do evento (formato: YYYY-MM-DDTHH:mm:ss)',
        example: '2025-11-24T14:00:00',
    })
    @IsString({ message: 'A data inicial deve ser uma string' })
    start!: string;

    @ApiProperty({
        description: 'Data e hora de término do evento (formato: YYYY-MM-DD HH:mm:ss)',
        example: '2025-11-24 15:00:00',
    })
    @IsString({ message: 'A data final deve ser uma string' })
    end!: string;

    @ApiProperty({
        description: 'Tag usada para identificar o tipo de evento e a equipe que irá conduzir o agendamento',
        example: 'Manutenção preventiva',
    })
    @IsString({ message: 'A tag deve ser uma string' })
    tag!: string;

    @ApiProperty({
        description: 'Nome do técnico responsável pelo atendimento em campo',
        example: 'João da Silva',
    })
    @IsString({ message: "O nome do técnico de campo deve ser uma string" })
    tecnicoCampo!: string;

    @ApiProperty({
        description: 'Ip do(s) equipamento(s) relacionado(s) ao evento',
        example: '192.168.100.100, 192.168.100.101',
    })
    @IsArray({ message: 'Os IPs devem ser um array de strings' })
    ipEquipamentos!: string[];

    @ApiPropertyOptional({
        description: 'Status inicial do evento (opcional)',
        example: 'Pendente',
    })
    @IsOptional()
    @IsString({ message: 'O status deve ser uma string' })
    status!: string;

    @ApiPropertyOptional({
        description: 'Descrição adicional do evento (opcional)',
        example: 'Equipamento apresentou falhas intermitentes.',
    })
    @IsOptional()
    @IsString({ message: 'A descrição deve ser uma string' })
    description?: string;
}
