import {
  Post,
  Get,
  Patch,
  Delete,
  Controller,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EquipamentoService } from './equipamentos.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Equipamentos } from './equipamentos.entity';
import { CreateEquipamentoDto } from './dto/createEquipamento.dto';
import { UpdateEquipamentoDto } from './dto/updateEquipamento.dto';

@ApiTags('Equipamentos')
@ApiBearerAuth()
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentoService: EquipamentoService) {}

  // --------------------------------------------------------------------
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cadastrar um equipamento',
    description:
      'Cria um novo equipamento vinculado a uma usina. Valida número de série, IP único dentro da mesma usina e quantidade de portas caso tenha pai.',
  })
  @ApiResponse({
    status: 201,
    description: 'Equipamento criado com sucesso.',
    type: Equipamentos,
  })
  @ApiResponse({
    status: 404,
    description: 'Usina ou equipamento pai não encontrado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Número de série ou IP já existentes.',
  })
  async createEquipamento(
    @Body() createEquipamentoDto: CreateEquipamentoDto,
  ): Promise<Equipamentos> {
    return this.equipamentoService.createEquipamento(createEquipamentoDto);
  }

  // --------------------------------------------------------------------
  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar todos os equipamentos',
    description:
      'Retorna todos os equipamentos cadastrados, incluindo suas relações (usina, pai, filhos).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso.',
    type: [Equipamentos],
  })
  async findAll(): Promise<Equipamentos[]> {
    return this.equipamentoService.findAll();
  }

  // --------------------------------------------------------------------
  @Get('details/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obter detalhes de um equipamento',
    description:
      'Busca um equipamento pelo ID e retorna informações completas, incluindo pai, filhos e usina associada.',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipamento encontrado.',
    type: Equipamentos,
  })
  @ApiResponse({
    status: 404,
    description: 'Equipamento não encontrado.',
  })
  async findOne(@Param('id') id: string): Promise<Equipamentos> {
    return this.equipamentoService.getEquipamentoById(id);
  }

  // --------------------------------------------------------------------
  @Patch('edit/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Editar equipamento',
    description:
      'Edita informações do equipamento. Valida IP, número de série e troca de equipamento pai, incluindo verificação de portas disponíveis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipamento atualizado com sucesso.',
    type: Equipamentos,
  })
  @ApiResponse({
    status: 404,
    description: 'Equipamento ou pai não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Novo pai não possui portas suficientes para receber os filhos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Número de série ou IP já estão em uso.',
  })
  async updateEquipamento(
    @Param('id') id: string,
    @Body() updateEquipamentoDto: UpdateEquipamentoDto,
  ): Promise<Equipamentos> {
    return this.equipamentoService.updateEquipamento(id, updateEquipamentoDto);
  }

  // --------------------------------------------------------------------
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Excluir equipamento',
    description: 'Remove um equipamento do sistema definitivamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipamento excluído com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Equipamento não encontrado.',
  })
  async deleteEquipamento(@Param('id') id: string): Promise<void> {
    return this.equipamentoService.deleteEquipamento(id);
  }
}
