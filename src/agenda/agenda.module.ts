import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agenda } from './agenda.entity';
import { User } from 'src/user/user.entity';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { Usina } from 'src/usina/usina.entity';
import { Entidade } from 'src/entidade/entidade.entity';
import { Equipamentos } from 'src/equipamentos/equipamentos.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Agenda, User, Usina, Entidade, Equipamentos]), UserModule],
    controllers: [AgendaController],
    providers: [AgendaService],
    exports: [AgendaService],
})
export class AgendaModule {}
