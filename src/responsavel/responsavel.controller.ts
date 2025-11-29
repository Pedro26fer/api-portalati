import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateResponsavelDto } from './dto/create_responsavel.dto';
import { Responsavel } from './reponsavel.entity';
import { ResponsavelService } from './responsavel.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateResponsavelDto } from './dto/update_responsavel.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Responsável')
@Controller('responsavel')
export class ResponsavelController {
  constructor(private readonly responsavelService: ResponsavelService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar um novo responsável' })
  @ApiResponse({
    status: 201,
    description: 'Responsável criado com sucesso.',
    type: Responsavel,
  })
  @ApiResponse({
    status: 409,
    description: 'O nome do responsável já está em uso.',
  })
  @ApiBody({ type: CreateResponsavelDto })
  async registerResponsavel(
    @Body() createResposavelDto: CreateResponsavelDto,
  ): Promise<Responsavel> {
    return this.responsavelService.createResponsavel(createResposavelDto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Listar todos os responsáveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de responsáveis retornada com sucesso.',
    type: [Responsavel],
  })
  async findAll(): Promise<Responsavel[]> {
    return await this.responsavelService.getAll();
  }

  @Get('responsavel_by_name')
  @ApiQuery({ name: 'nome', required: true })
  async findOneByName(@Query('nome') nome: string): Promise<Responsavel> {
    return await this.responsavelService.getResponsavelByName(nome);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir um responsável' })
  @ApiParam({
    name: 'id',
    description: 'ID do responsável',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Responsável removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Responsável não encontrado.',
  })
  async deleteResponsavel(@Param('id') id: string): Promise<void> {
    return await this.responsavelService.removeResponsavel(id);
  }

  @Patch('edit/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar informações de um responsável' })
  @ApiParam({
    name: 'id',
    description: 'ID do responsável',
    type: String,
  })
  @ApiBody({ type: UpdateResponsavelDto })
  @ApiResponse({
    status: 200,
    description: 'Responsável atualizado com sucesso.',
    type: Responsavel,
  })
  @ApiResponse({
    status: 404,
    description: 'Responsável não encontrado.',
  })
  async editResponsavel(
    @Param('id') id: string,
    @Body() updateData: UpdateResponsavelDto,
  ): Promise<Responsavel> {
    return await this.responsavelService.updateResponsavel(id, updateData);
  }
}
