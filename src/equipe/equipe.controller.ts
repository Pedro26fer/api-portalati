import {
  Controller,
  NotFoundException,
  ForbiddenException,
  NotAcceptableException,
  ConflictException,
  Query,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

import { EquipeService } from './equipe.service';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';
import { Equipe } from './equipe.entity';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { User } from 'src/user/user.entity';

@ApiTags('Equipe')
@Controller('equipe')
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) {}

  @Post('create')
  @ApiOperation({ summary: 'Cria uma nova equipe' })
  @ApiResponse({ status: 201, description: 'Equipe criada com sucesso', type: Equipe })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createEquipe(
    @Body() createEquipeDTO: CreateEquipeDto,
  ): Promise<Equipe> {
    return await this.equipeService.create(createEquipeDTO);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lista todas as equipes' })
  @ApiResponse({ status: 200, description: 'Lista de equipes retornada com sucesso', type: [Equipe] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getAllEquipes(): Promise<Equipe[]> {
    return await this.equipeService.findAll();
  }

  @Get('integrantes')
  @ApiOperation({ summary: 'Busca integrantes de uma equipe pelo nome da equipe' })
  @ApiQuery({ name: 'nome', required: true, description: 'Nome da equipe' })
  @ApiResponse({ status: 200, description: 'Integrantes retornados com sucesso', type: [User] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async integrantesList(
    @Query('nome') nome: string,
  ): Promise<User[]> {
    return this.equipeService.findIntegrantes(nome);
  }

  @Get('/info/:id')
  @ApiOperation({ summary: 'Retorna informações de uma equipe pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da equipe' })
  @ApiResponse({ status: 200, description: 'Equipe encontrada', type: Equipe })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  async getEquipeInfo(@Param('id') id: string): Promise<Equipe> {
    return await this.equipeService.findById(id);
  }

  @Patch('/update/:id')
  @ApiOperation({ summary: 'Atualiza informações de uma equipe' })
  @ApiParam({ name: 'id', description: 'ID da equipe' })
  @ApiResponse({ status: 200, description: 'Equipe atualizada com sucesso', type: Equipe })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateEquipe(
    @Param('id') id: string,
    @Body() updateEquipeDTO: UpdateEquipeDto,
  ): Promise<Equipe> {
    await this.equipeService.findById(id);
    return await this.equipeService.updateEquipe(id, updateEquipeDTO);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Deleta uma equipe pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da equipe' })
  @ApiResponse({ status: 200, description: 'Equipe deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteEquipe(@Param('id') id: string): Promise<void> {
    await this.equipeService.findById(id);
    await this.equipeService.removeEquipe(id);
  }
}
