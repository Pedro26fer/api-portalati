import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EntidadeService } from './entidade.service';
import { CreateEntidadeDto } from './dto/createEntidade.dto';
import { UpdateEntidadeDto } from './dto/updateEntidade.dto';
import { Entidade } from './entidade.entity';
import { Usina } from 'src/usina/usina.entity';
import { JwtAuthGuard } from 'src/entidade/jwt-auth.guard';

@Controller('entidade')
export class EntidadeController {
  constructor(private readonly entidadeService: EntidadeService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createEntidade(
    @Body() createEntidadeDto: CreateEntidadeDto,
  ): Promise<Entidade> {
    return await this.entidadeService.createEntidade(createEntidadeDto);
  }

  @Get('all')
  async findAll(): Promise<Entidade[]> {
    return await this.entidadeService.findAll();
  }

  @Get('profile/:id')
  async profile(@Param('id') id: string): Promise<Entidade> {
    return await this.entidadeService.profile(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEntidadeDto: UpdateEntidadeDto,
  ): Promise<Entidade> {
    return await this.entidadeService.updateEntidade(id, updateEntidadeDto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<void> {
    return await this.entidadeService.deleteEntidade(id);
  }
}
