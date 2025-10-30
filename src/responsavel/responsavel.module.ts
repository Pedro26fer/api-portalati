import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsinaService } from 'src/usina/usina.service';
import { Responsavel } from './reponsavel.entity';
import { Usina } from 'src/usina/usina.entity';
import { ResponsavelController } from './responsavel.controller';
import { ResponsavelService } from './responsavel.service';

@Module({
    imports: [TypeOrmModule.forFeature([Responsavel, Usina])],
    providers: [ResponsavelService],
    controllers: [ResponsavelController],
    exports:[ResponsavelService]
})
export class ResponsavelModule {}
