import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({
    description: 'Email do usuário para autenticação',
    example: 'usuario@empresa.com',
  })
  @IsEmail({}, { message: 'O email deve ser um email válido' })
  @IsNotEmpty({ message: 'O campo não pode ser vazio' })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário para login',
    example: 'minhaSenha123',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'Você deve fornecer uma senha' })
  password!: string;

  @ApiPropertyOptional({
    description:
      'Data local do cliente (opcional). Usada caso você queira ajustar logs/fusos horários.',
    example: '2025-11-25 14:32:00',
  })
  @IsString()
  @IsOptional()
  dataLocal?: string;
}
