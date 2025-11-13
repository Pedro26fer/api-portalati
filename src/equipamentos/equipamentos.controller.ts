import {
  Post,
  Get,
  Patch,
  Delete,
  Controller,
  Body,
  Param,
} from '@nestjs/common';
import { EquipamentoService } from './equipamentos.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Equipamentos } from './equipamentos.entity';
import { CreateEquipamentoDto } from './dto/createEquipamento.dto';

@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentoService: EquipamentoService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async createEquipamento(
    @Body() createEquipamentoDto: CreateEquipamentoDto,
  ): Promise<Equipamentos> {
    return this.equipamentoService.createEquipamento(createEquipamentoDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Equipamentos[]> {
    return this.equipamentoService.findAll();
  }

  @Get('details/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Equipamentos> {
    return this.equipamentoService.getEquipamentoById(id);
  }

  @Patch('edit/:id')
  @UseGuards(JwtAuthGuard)
  async updateEquipamento(
    @Param('id') id: string,
    @Body() updateEquipamentoDto: any,
  ): Promise<Equipamentos> {
    return this.equipamentoService.updateEquipamento(id, updateEquipamentoDto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteEquipamento(@Param('id') id: string): Promise<void> {
    return this.equipamentoService.deleteEquipamento(id);
  }
}
