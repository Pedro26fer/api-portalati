import { ConflictException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/user.entity';
import { Equipe } from 'src/equipe/equipe.entity';

export interface JWTPayload {
  userId: string;
  email: string;
  pNome: string;
  entidade: string | null;
  equipe: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    pNome: string;
    email: string;
    entidade: string | null;
    equipe: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.log(`Validando usuário com email: ${email}`);
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      this.logger.log(`Usuário validado com sucesso: ${email}`);
      const { password, ...result } = user;
      return result;
    }
    this.logger.warn(`Falha na validação do usuário: ${email}`);
    return null;
  }

  async login(loginDto: LoginDTO): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciais Inválidas');
    }

    if(!user.isActive){
      this.logger.warn(`Tentativa de login com usuário inativo: ${loginDto.email}`);
      throw new ConflictException('Usuário se encontra inativo')
    }

    await this.userService.updateLastAccess(user.id, loginDto.dataLocal)
       

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      pNome: user.pNome,
      entidade: user.equipes ? user.equipes.map((equipe: Equipe) => equipe.entidade.nome) : null,
      equipe: user.equipes ? user.equipes.map((equipe: Equipe) => equipe.nome) : null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        pNome: user.pNome,
        entidade: user.equipes ? user.equipes.map((equipe: Equipe) => equipe.entidade.nome) : null,
        equipe: user.equipes ? user.equipes.map((equipe: Equipe) => equipe.nome) : null,
      },
    };
  }

  async validateToken(jwtPayload: JWTPayload): Promise<User> {
    this.logger.log(`Validando token para usuário ID: ${jwtPayload.userId}`);
    const user = await this.userService.getUserById(jwtPayload.userId);

    if (!user) {
      this.logger.warn(`Token inválido para usuário ID: ${jwtPayload.userId}`);
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }
}
