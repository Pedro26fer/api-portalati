import {
  Post,
  Get,
  Controller,
  HttpCode,
  HttpStatus,
  Request,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza login e retorna token JWT' })
  @ApiBody({
    type: LoginDTO,
    description: 'Credenciais para autenticação',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'usuario@teste.com',
          pNome: 'João',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDTO: LoginDTO): Promise<LoginResponse> {
    return this.authService.login(loginDTO);
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna informações do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário logado',
    schema: {
      example: {
        id: 1,
        email: 'usuario@teste.com',
        pNome: 'João',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido',
  })
  async getProfile(@Request() req: any) {
    return {
      id: req.user.id,
      email: req.user.email,
      pNome: req.user.pNome,
    };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verifica se o token JWT é válido' })
  @ApiResponse({
    status: 200,
    description: 'Token válido e informações do usuário',
    schema: {
      example: {
        valid: true,
        user: {
          id: 1,
          email: 'usuario@teste.com',
          pNome: 'João',
          entidade: 'Empresa XPTO',
          equipe: 'Time A',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        pNome: req.user.pNome,
        entidade: req.user.entidade,
        equipe: req.user.equipe,
      },
    };
  }
}
