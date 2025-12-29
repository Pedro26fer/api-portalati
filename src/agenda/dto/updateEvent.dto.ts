import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './createEvent.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEmail } from 'class-validator';
export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({
    description:
      'Email do técnico responsável se for do interesse alterar o tecnico responsável peelo atendimento. ',
    example: 'tecnico@empresa.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email do técnico deve ser um email válido' })
  tecnicoEmail!: string;

  @ApiPropertyOptional({
    description:
      'ID da usina onde o evento será realizado, caso seja necessário alterar a usina do evento.',
  })
  @IsOptional()
  usinaNome!: string;
}
