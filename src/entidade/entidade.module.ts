import { Module } from '@nestjs/common';
import { Entidade } from './entidade.entity';
import { EntidadeService } from './entidade.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntidadeController } from './entidade.controller';
import { UsinaModule } from 'src/usina/usina.module';
import { Usina } from 'src/usina/usina.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Entidade])],
    providers: [EntidadeService],
    controllers: [EntidadeController],
    exports: [EntidadeService]
})
export class EntidadeModule {}
