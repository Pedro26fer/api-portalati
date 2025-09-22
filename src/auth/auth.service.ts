import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/user.entity';

export interface JWTPayload {
  userId: string;
  email: string;
  pNome: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    pNome: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDTO): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciais Inválidas');
    }

    if(!user.isActive){
      throw new ConflictException('Usuário se encontra inativo')
    }

    await this.userService.updateLastAccess(user.id, loginDto.dataLocal)
       

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      pNome: user.pNome,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        pNome: user.pNome,
      },
    };
  }

  async validateToken(jwtPayload: JWTPayload): Promise<User> {
    const user = await this.userService.getUserById(jwtPayload.userId);

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }
}
