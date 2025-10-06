import { NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/createUsuarioDto.dto';
import { UpdateUserDTO } from './dto/updateUsuarioDto.dto';
import { Equipe } from 'src/equipe/equipe.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Equipe)
    private equipeRepository: Repository<Equipe>,
  ) {}

  async createUser(createUsuarioDto: CreateUsuarioDto): Promise<User> {
    this.logger.log('Criando usuário...');
    const { email, password, pNome, uNome, fotoPerfil } = createUsuarioDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser && existingUser.isActive == true) {
      this.logger.warn(`Tentativa de criar usuário com email já existente: ${email}`);
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let equipes: Equipe[] = [];
    if (createUsuarioDto.equipes) {
      equipes = await Promise.all(
        createUsuarioDto.equipes.map(async (equipeName) => {
          const equipe = await this.equipeRepository.findOne({ where: { nome: equipeName } });
          if (!equipe) {
            this.logger.warn(`Equipe não encontrada: ${equipeName}`);
            throw new NotFoundException(`Equipe não encontrada: ${equipeName}`);
          }
          return equipe;
        })
      );
    }

    const newUser = this.userRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      equipes: equipes
    });
    this.logger.log(`Usuário criado com sucesso: ${email}`);

    await this.userRepository.save(newUser);
    return newUser;

}

  async getAllUsers(): Promise<User[]> {
    this.logger.log('Buscando todos os usuários...');
    return await this.userRepository.find({relations: ['equipes', 'equipes.entidade']});
  }

  async getUserById(id: string): Promise<User> {
    this.logger.log(`Buscando usuário com ID: ${id}`);
    const user = await this.userRepository.findOneOrFail({ where: { id }, relations: ['equipes', 'equipes.entidade'] });
    if (!user) {
      this.logger.warn(`Usuário não encontrado com ID: ${id}`);
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async inactivateUser(id: string): Promise<void> {
    this.logger.log(`Inativando usuário com ID: ${id}`);
    const userToInactivate = await this.getUserById(id);
    if(!userToInactivate.isActive){
      this.logger.warn(`Tentativa de inativar usuário já inativo com ID: ${id}`);
      throw new ForbiddenException('Usuário já está inativo')
    }
    userToInactivate.isActive = false
    await this.userRepository.save(userToInactivate);
  }

  async activateUser(id: string): Promise<void> {
    this.logger.log(`Ativando usuário com ID: ${id}`);
    const userToActivate = await this.getUserById(id);
    if(userToActivate.isActive){
      this.logger.warn(`Tentativa de ativar usuário já ativo com ID: ${id}`);
      throw new ForbiddenException('Usuário já está ativo')
    }
    userToActivate.isActive = true
    this.logger.log(`Usuário com ID: ${id} ativado com sucesso`);
    await this.userRepository.save(userToActivate);
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deletando usuário com ID: ${id}`);
    const userToDelete = await this.getUserById(id);
    await this.userRepository.remove(userToDelete);
  }

  async updateLastAccess(id: string, dataLocal? :string): Promise<void> {
    this.logger.log(`Atualizando último acesso do usuário com ID: ${id}`);
    const user = await this.getUserById(id);
    user.ultimoAcesso = dataLocal? new Date(dataLocal): new Date();
    await this.userRepository.save(user);
  }

  async updatePersonalInfo(
    id: string,
    updatePersonalInfo: UpdateUserDTO,
  ): Promise<User> {
    this.logger.log(`Atualizando informações do usuário com ID: ${id}`);
    const user = await this.getUserById(id);
    if (!user || user.isActive == false) {
      this.logger.warn(`Usuário não encontrado ou inativo com ID: ${id}`);
      throw new NotFoundException('Usuário não encontrado ou inativo!');
    }

    if(updatePersonalInfo.email && updatePersonalInfo.email !== user.email){
      this.logger.log(`Atualizando email do usuário com ID: ${id}`);
        const emailExists = await this.userRepository.findOne({where: {email: updatePersonalInfo.email}});
        if(emailExists && emailExists.isActive == true){
            this.logger.warn(`Tentativa de atualizar para um email já existente: ${updatePersonalInfo.email}`);
            throw new ConflictException('Email já está em uso');
        }
    }

    if(updatePersonalInfo.password){
        this.logger.log(`Atualizando senha do usuário com ID: ${id}`);
        const hashedNewPassword = await bcrypt.hash(updatePersonalInfo.password, 10);
        updatePersonalInfo.password = hashedNewPassword;
    }

    if(updatePersonalInfo.equipes){
      const equipes: Equipe[] = await Promise.all(
        updatePersonalInfo.equipes.map(async (equipeName) => {
          const equipe = await this.equipeRepository.findOne({where: {nome: equipeName}});
          if(!equipe){
            this.logger.warn(`Equipe não encontrada: ${equipeName}`);
            throw new NotFoundException(`Equipe não encontrada: ${equipeName}`);
          }
          return equipe;
        })
      );
      user.equipes = equipes;
    }
    return await this.userRepository.save({...user,...updatePersonalInfo, equipes: user.equipes});
  }

  async findByEmail(email:string): Promise<User>{
    this.logger.log(`Buscando usuário com email: ${email}`);
    const user =  await this.userRepository.findOne({where: {email}});
    if(!user){
        this.logger.warn(`Usuário não encontrado com email: ${email}`);
        throw new NotFoundException('Usuário não encontrado');
    } else if (!user.isActive) {
        this.logger.warn(`Usuário inativo com email: ${email}`);
        throw new ConflictException('Usuário se encontra inativo')
    }


    return user;
  }




}
