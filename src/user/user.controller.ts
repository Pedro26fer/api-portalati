import {
  Controller,
  ForbiddenException,
  Request,
  UseGuards,
  Post,
  Get,
  Param,
  Delete,
  Body,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUsuarioDto } from './dto/createUsuarioDto.dto';
import { UpdateUserDTO } from './dto/updateUsuarioDto.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ======================================================================================
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post('sign_up')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async createUser(@Body() createUsuarioDto: CreateUsuarioDto): Promise<User> {
    return this.userService.createUser(createUsuarioDto);
  }

  // ======================================================================================
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  // ======================================================================================
  @Get('usuarios_ati')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuários da ATI' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  async getUsersAti(): Promise<User[]> {
    return this.userService.getUserAti();
  }

  // ======================================================================================
  @Get('availability')
  @ApiOperation({
    summary: 'Consultar disponibilidade da equipe em uma data específica',
  })
  @ApiQuery({
    name: 'tag',
    required: true,
    example: 'suporte',
    description: 'Identificador da equipe/tipo de técnico',
  })
  @ApiQuery({
    name: 'data',
    required: true,
    example: '2025-11-25',
    description: 'Data da consulta no formato YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidades retornadas com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros ausentes ou inválidos.',
  })
  async getTeamAvailability(
    @Query('tag') tag: string,
    @Query('data') dataString: string,
  ) {
    if (!tag || !dataString) {
      throw new BadRequestException(
        'A tag da equipe e a data são obrigatórias para consultar a disponibilidade.',
      );
    }

    return this.userService.getAvaibleTimesPerTeam(tag, dataString);
  }

  // ======================================================================================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter informações do usuário autenticado',
  })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  async getMyUser(@Request() req: any): Promise<User> {
    const id = req.user.id;
    return this.userService.getUserById(id);
  }

  // ======================================================================================
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('profileById/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiOperation({ summary: 'Obter um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  // ======================================================================================
  @Get('search_for_email')
  @ApiOperation({ summary: 'Buscar usuário pelo email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'teste@teste.com' } },
    },
  })
  async findByEmail(@Body('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  // ======================================================================================
  @Patch('inactivate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiOperation({ summary: 'Inativar um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário inativado.' })
  async inactivateUser(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.userService.inactivateUser(id);
  }

  // ======================================================================================
  @Patch('update-last-access/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiOperation({
    summary: 'Atualizar o último acesso do usuário (geralmente usado pelo front)',
  })
  async updateLastAccess(
    @Param('id') id: string,
    @Body('dataLocal') dataLocal?: string,
  ) {
    return this.userService.updateLastAccess(id, dataLocal);
  }

  // ======================================================================================
  @Patch('activate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Ativar um usuário' })
  async activateUser(@Param('id') id: string): Promise<void> {
    await this.userService.activateUser(id);
  }

  // ======================================================================================
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Excluir um usuário' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  // ======================================================================================
  @Patch('update-personal-info')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados pessoais do usuário logado' })
  async updatePersonalInfo(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    const id = req.user.id;
    return this.userService.updatePersonalInfo(id, updateUserDto);
  }

  // ======================================================================================
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiOperation({ summary: 'Atualizar dados de um usuário específico (admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    return this.userService.updatePersonalInfo(id, updateUserDto);
  }
}
