import {
  Controller,
  NotFoundException,
  ForbiddenException,
  NotAcceptableException,
  ConflictException,
} from '@nestjs/common';
import {
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';
import { Equipe } from './equipe.entity';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('equipe')
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createEquipe(
    @Body() createEquipeDTO: CreateEquipeDto,
  ): Promise<Equipe> {
    return await this.equipeService.create(createEquipeDTO);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getAllEquipes(): Promise<Equipe[]> {
    return await this.equipeService.findAll();
  }

  @Get('/info/:id')
  async getEquipeInfo(@Param('id') id: string): Promise<Equipe> {
    return await this.equipeService.findById(id);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateEquipe(
    @Param('id') id: string,
    @Body() updateEquipeDTO: UpdateEquipeDto,
  ): Promise<Equipe> {
    await this.equipeService.findById(id);
    return await this.equipeService.updateEquipe(id, updateEquipeDTO);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteEquipe(@Param('id') id: string): Promise<void> {
    await this.equipeService.findById(id);
    await this.equipeService.removeEquipe(id);
  }
}
