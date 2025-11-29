import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsNotEmpty 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipamentoDto {

  @ApiProperty({
    description: 'Nome do equipamento.',
    example: 'Gateway Principal'
  })
  @IsNotEmpty({ message: 'O nome do equipamento é obrigatório.' })
  @IsString({ message: 'O nome do equipamento deve ser uma string.' })
  nome!: string;

  @ApiPropertyOptional({
    description: 'Apelido do equipamento, caso exista.',
    example: 'GW-01'
  })
  @IsOptional()
  @IsString({ message: 'O apelido do equipamento deve ser uma string.' })
  apelido?: string;

  @ApiProperty({
    description: 'Descrição detalhada do equipamento.',
    example: 'Gateway de comunicação para medidores Modbus.'
  })
  @IsNotEmpty({ message: 'A descrição do equipamento é obrigatória.' })
  @IsString({ message: 'A descrição do equipamento deve ser uma string.' })
  descricao!: string;

  @ApiProperty({
    description: 'Número de série único do equipamento.',
    example: 12345678
  })
  @IsNotEmpty({ message: 'O número de série do equipamento é obrigatório.' })
  @IsNumber({}, { message: 'O número de série do equipamento deve ser um número.' })
  numSerie!: number;

  @ApiPropertyOptional({
    description: 'Quantidade de portas disponíveis no equipamento.',
    example: 4
  })
  @IsOptional()
  @IsNumber({}, { message: 'O número de portas disponíveis deve ser um número.' })
  portasDisponiveis?: number;

  @ApiProperty({
    description: 'Versão ou firmware do equipamento.',
    example: 'v2.1.3'
  })
  @IsNotEmpty({ message: 'A versão do equipamento é obrigatória.' })
  @IsString({ message: 'A versão do equipamento deve ser uma string.' })
  versao!: string;

  @ApiProperty({
    description: 'Endereço IP local configurado para o equipamento.',
    example: '192.168.100.20'
  })
  @IsNotEmpty({ message: 'O IP local do equipamento é obrigatório.' })
  @IsString({ message: 'O IP local do equipamento deve ser uma string.' })
  ipLocal!: string;

  @ApiProperty({
    description: 'Nome da usina associada ao equipamento.',
    example: 'USINA SOLAR NORTE'
  })
  @IsNotEmpty({ message: 'A usina do equipamento é obrigatória.' })
  @IsString({ message: 'O nome da usina do equipamento deve ser uma string.' })
  usina!: string;

  @ApiPropertyOptional({
    description: 'Número de série do equipamento pai, caso exista.',
    example: 987654321
  })
  @IsOptional()
  @IsNumber({}, { message: 'O número de série do equipamento pai deve ser um número.' })
  equipamento_pai?: number;

}
