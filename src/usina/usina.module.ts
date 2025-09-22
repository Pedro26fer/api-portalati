import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usina } from './usina.entity';
import { UsinaService } from './usina.service';
import { UsinaController } from './usina.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Usina])],
    providers: [UsinaService],
    controllers: [UsinaController],
    exports: [UsinaService]
})
export class UsinaModule {}
