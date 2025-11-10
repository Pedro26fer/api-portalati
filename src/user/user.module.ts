import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Equipe } from 'src/equipe/equipe.entity';
import { Responsavel } from 'src/responsavel/reponsavel.entity';
import { Agenda } from 'src/agenda/agenda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Equipe, Agenda])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
