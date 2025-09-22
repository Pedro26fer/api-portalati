import {Module} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from 'src/strategies/strategies.strategy';


/**
 * Módulo de Autenticação
 *
 * Este módulo encapsula toda a funcionalidade de autenticação,
 * incluindo JWT, Passport e estratégias de validação.
 */
@Module({
  imports: [
    UserModule, // Importa o módulo de técnicos
    PassportModule, // Módulo do Passport para estratégias de autenticação

    // Configuração do JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Exporta o serviço para uso em outros módulos
})
export class AuthModule {}
