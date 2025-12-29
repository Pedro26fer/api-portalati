import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards, Query,
} from '@nestjs/common';
import { EntidadeService } from './entidade.service';
import { CreateEntidadeDto } from './dto/createEntidade.dto';
import { UpdateEntidadeDto } from './dto/updateEntidade.dto';
import { Entidade } from './entidade.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import * as sea from "node:sea";

@ApiTags('entidade')
@Controller('entidade')
export class EntidadeController {
  constructor(private readonly entidadeService: EntidadeService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova entidade (usina)' })
  @ApiBody({
    type: CreateEntidadeDto,
    description: 'Dados necessários para criar uma nova entidade',
  })
  @ApiResponse({
    status: 201,
    description: 'Entidade criada com sucesso',
    type: Entidade,
  })
  @ApiResponse({
    status: 403,
    description: 'Nome ou link já existentes',
  })
  async createEntidade(
    @Body() createEntidadeDto: CreateEntidadeDto,
  ): Promise<Entidade> {
    return await this.entidadeService.createEntidade(createEntidadeDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Lista todas as entidades cadastradas, incluindo equipes e subequipes',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de entidades retornada com sucesso',
    type: [Entidade],
  })
  async findAll(
      @Query('search') search?: string
  ): Promise<Entidade[]> {
    return await this.entidadeService.findAll(search);
  }

  @Get('actives')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Lista todas as entidades cadastradas que estão ativas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de entidades ativas retornada com sucesso',
    type: [Entidade],
  })
  async findActives(): Promise<Entidade[]> {
    return await this.entidadeService.findActives();
  }

  @Get('inactives')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
        'Lista todas as entidades cadastradas que estão inativas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de entidades inativas retornada com sucesso',
    type: [Entidade],
  })
  async findInactives(): Promise<Entidade[]> {
    return await this.entidadeService.findInactives();
  }

  @Get('profile/:id')
  @ApiOperation({
    summary: 'Retorna detalhes de uma entidade específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da entidade',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entidade encontrada com sucesso',
    type: Entidade,
  })
  @ApiResponse({
    status: 404,
    description: 'Entidade não encontrada',
  })
  async profile(@Param('id') id: string): Promise<Entidade> {
    return await this.entidadeService.profile(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza os dados de uma entidade' })
  @ApiParam({
    name: 'id',
    description: 'ID da entidade que será atualizada',
  })
  @ApiBody({
    type: UpdateEntidadeDto,
    description: 'Dados atualizáveis da entidade',
  })
  @ApiResponse({
    status: 200,
    description: 'Entidade atualizada com sucesso',
    type: Entidade,
  })
  @ApiResponse({
    status: 403,
    description: 'Nome, logo ou link já existem',
  })
  @ApiResponse({
    status: 404,
    description: 'Entidade não encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEntidadeDto: UpdateEntidadeDto,
  ): Promise<Entidade> {
    return await this.entidadeService.updateEntidade(id, updateEntidadeDto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove uma entidade do sistema' })
  @ApiParam({
    name: 'id',
    description: 'ID da entidade a ser removida',
  })
  @ApiResponse({
    status: 200,
    description: 'Entidade removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Entidade não encontrada',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.entidadeService.deleteEntidade(id);
  }
}
