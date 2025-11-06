import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usina } from './usina.entity';
import { UsinaService } from './usina.service';
import { UsinaController } from './usina.controller';
import { Entidade } from 'src/entidade/entidade.entity';
import { Responsavel } from 'src/responsavel/reponsavel.entity';
import { Equipamentos } from 'src/equipamentos/equipamentos.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Usina, Entidade, Responsavel, Equipamentos])],
    providers: [UsinaService],
    controllers: [UsinaController],
    exports: [UsinaService]
})
export class UsinaModule {}
