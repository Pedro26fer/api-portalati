import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateResponsavelDto } from './dto/create_responsavel.dto';
import { Responsavel } from './reponsavel.entity';
import { ResponsavelService } from './responsavel.service';
import { JwtAuthGuard } from 'src/entidade/jwt-auth.guard';
import { UpdateResponsavelDto } from './dto/update_responsavel.dto';

@Controller('responsavel')
export class ResponsavelController {
  constructor(private readonly responsavelService: ResponsavelService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerResponsavel(
    @Body() createResposavelDto: CreateResponsavelDto,
  ): Promise<Responsavel> {
    return this.responsavelService.createResponsavel(createResposavelDto);
  }

  @Get('list')
  async findAll(): Promise<Responsavel[]> {
    return await this.responsavelService.getAll();
  }

  @Get('responsavel_by_name')
  async findOneByName(@Body('nome') nome: string): Promise<Responsavel> {
    return await this.responsavelService.getResponsavelByName(nome);
  }

  @Get('responsavel_by_id/:id')
  async findOneById(@Body('id') id: string): Promise<Responsavel> {
    return await this.responsavelService.getResponsavelById(id);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteResponsavel(@Param('id') id: string): Promise<void> {
    return await this.responsavelService.removeResponsavel(id);
  }

  @Patch('edit/:id')
  @UseGuards(JwtAuthGuard)
  async editResponsavel(
    @Param('id') id: string,
    @Body() updateData: UpdateResponsavelDto,
  ): Promise<Responsavel> {
    return await this.responsavelService.updateResponsavel(id, updateData);
  }
}
