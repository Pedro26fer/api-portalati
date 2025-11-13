// permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from './permissions.guard';
import { Entidade } from 'src/entidade/entidade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entidade])],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class PermissionsModule {}
