import { Controller, Body, Param } from '@nestjs/common';
import { Post, Get, Patch, Delete } from '@nestjs/common';
import { CreateUsinaDto } from './dto/create-usina.dto';
import { UpdateUsinaDto } from './dto/update-usina.dto';
import { JwtAuthGuard } from 'src/entidade/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Usina } from './usina.entity';
import { UsinaService } from './usina.service';

@Controller('usinas')
export class UsinaController {
  constructor(private readonly usinaService: UsinaService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createUsina(@Body() createUsinaDto: CreateUsinaDto): Promise<Usina> {
    return await this.usinaService.createUsina(createUsinaDto);
  }

  @Get('all')
  async findAll(): Promise<Usina[]> {
    return await this.usinaService.findAll();
  }

  @Patch('edit_info/:id')
  @UseGuards(JwtAuthGuard)
  async updatePersonalInfo(
    @Param('id') id: string,
    @Body() updateUsinaDto: UpdateUsinaDto,
  ): Promise<Usina> {
    return await this.usinaService.updateUsinaInfo(id, updateUsinaDto);
  }

  @Get('info/:id')
  async getInfoById(@Param('id') id: string): Promise<Usina> {
    return await this.usinaService.specificUsina(id);
  }

  @Delete('remove/:id')
  @UseGuards(JwtAuthGuard)
  async removeUsinaById(@Param('id') id: string): Promise<void> {
    return await this.usinaService.removeUsina(id);
  }
}
