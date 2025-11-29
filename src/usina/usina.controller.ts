import { Controller, Body, Param } from '@nestjs/common';
import { Post, Get, Patch, Delete } from '@nestjs/common';
import { CreateUsinaDto } from './dto/create-usina.dto';
import { UpdateUsinaDto } from './dto/update-usina.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Usina } from './usina.entity';
import { UsinaService } from './usina.service';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Usinas')
@Controller('usinas')
export class UsinaController {
  constructor(private readonly usinaService: UsinaService) {}

  // -----------------------------
  // CREATE
  // -----------------------------
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova usina' })
  @ApiResponse({
    status: 201,
    description: 'Usina criada com sucesso.',
    type: Usina,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não autenticado.',
  })
  @ApiBody({ type: CreateUsinaDto })
  async createUsina(@Body() createUsinaDto: CreateUsinaDto): Promise<Usina> {
    return await this.usinaService.createUsina(createUsinaDto);
  }

  // -----------------------------
  // GET ALL
  // -----------------------------
  @Get('all')
  @ApiOperation({ summary: 'Retorna todas as usinas cadastradas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usinas retornada com sucesso.',
    type: [Usina],
  })
  async findAll(): Promise<Usina[]> {
    return await this.usinaService.findAll();
  }

  // -----------------------------
  // UPDATE
  // -----------------------------
  @Patch('edit_info/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edita informações de uma usina' })
  @ApiParam({
    name: 'id',
    description: 'ID da usina a ser atualizada',
    example: '94d9c2fb-c3b3-4d3e-b8c0-065734d22a44',
  })
  @ApiBody({ type: UpdateUsinaDto })
  @ApiResponse({
    status: 200,
    description: 'Usina atualizada com sucesso.',
    type: Usina,
  })
  @ApiResponse({
    status: 404,
    description: 'Usina não encontrada.',
  })
  async updatePersonalInfo(
    @Param('id') id: string,
    @Body() updateUsinaDto: UpdateUsinaDto,
  ): Promise<Usina> {
    return await this.usinaService.updateUsinaInfo(id, updateUsinaDto);
  }

  // -----------------------------
  // GET BY ID
  // -----------------------------
  @Get('info/:id')
  @ApiOperation({ summary: 'Obtém informações de uma usina pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da usina',
    example: '94d9c2fb-c3b3-4d3e-b8c0-065734d22a44',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações da usina retornadas com sucesso.',
    type: Usina,
  })
  @ApiResponse({
    status: 404,
    description: 'Usina não encontrada.',
  })
  async getInfoById(@Param('id') id: string): Promise<Usina> {
    return await this.usinaService.specificUsina(id);
  }

  // -----------------------------
  // DELETE
  // -----------------------------
  @Delete('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove uma usina pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da usina a ser removida',
    example: '94d9c2fb-c3b3-4d3e-b8c0-065734d22a44',
  })
  @ApiResponse({
    status: 200,
    description: 'Usina removida com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usina não encontrada.',
  })
  async removeUsinaById(@Param('id') id: string): Promise<void> {
    return await this.usinaService.removeUsina(id);
  }
}
