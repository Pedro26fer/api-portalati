import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UsinaModule } from './usina/usina.module';
import { EntidadeModule } from './entidade/entidade.module';
import { EquipeModule } from './equipe/equipe.module';
import { ResponsavelModule } from './responsavel/responsavel.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { AgendaModule } from './agenda/agenda.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: Number(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: String(configService.get('DB_PASSWORD')),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Apenas em desenvolvimento
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    UsinaModule,
    EntidadeModule,
    EquipeModule,
    ResponsavelModule,
    EquipamentosModule,
    AgendaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
