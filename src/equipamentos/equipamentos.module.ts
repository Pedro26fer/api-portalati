import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from 'class-transformer';
import { Equipamentos } from './equipamentos.entity';
import { Usina } from 'src/usina/usina.entity';
import { EquipamentosController } from './equipamentos.controller';
import { EquipamentoService } from './equipamentos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Equipamentos, Usina])],
    controllers: [EquipamentosController],
    providers: [EquipamentoService],
    exports: [EquipamentoService],
})
export class EquipamentosModule {}
