import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entidade } from 'src/entidade/entidade.entity';
import { Equipe } from './equipe.entity';
import { EquipeController } from './equipe.controller';
import { EquipeService } from './equipe.service';

@Module({
    imports: [TypeOrmModule.forFeature([Equipe,Entidade])],
    controllers: [EquipeController],
    providers: [EquipeService],
    exports: [EquipeService],
})
export class EquipeModule {}
