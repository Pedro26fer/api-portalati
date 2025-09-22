import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/createUsuarioDto.dto';
import { UpdateUserDTO } from './dto/updateUsuarioDto.dto';
// import { UpdateUsuarioDto } from "./dto/updateUsuarioDto.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUsuarioDto: CreateUsuarioDto): Promise<User> {
    const { email, password, pNome, uNome, fotoPerfil } = createUsuarioDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser && existingUser.isActive == true) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async inactivateUser(id: string): Promise<void> {
    const userToInactivate = await this.getUserById(id);
    if(!userToInactivate.isActive){
      throw new ForbiddenException('Usuário já está inativo')
    }
    userToInactivate.isActive = false
    await this.userRepository.save(userToInactivate);
  }

  async deleteUser(id: string): Promise<void> {
    const userToDelete = await this.getUserById(id);
    await this.userRepository.remove(userToDelete);
  }

  async updateLastAccess(id: string, dataLocal? :string): Promise<void> {
    const user = await this.getUserById(id);
    user.ultimoAcesso = dataLocal? new Date(dataLocal): new Date();
    await this.userRepository.save(user);
  }

  async updatePersonalInfo(
    id: string,
    updatePersonalInfo: UpdateUserDTO,
  ): Promise<User> {
    const user = await this.getUserById(id);
    if (!user || user.isActive == false) {
      throw new NotFoundException('Usuário não encontrado ou inativo!');
    }

    if(updatePersonalInfo.email && updatePersonalInfo.email !== user.email){
        const emailExists = await this.userRepository.findOne({where: {email: updatePersonalInfo.email}});
        if(emailExists && emailExists.isActive == true){
            throw new ConflictException('Email já está em uso');
        }
    }

    if(updatePersonalInfo.password){
        const hashedNewPassword = await bcrypt.hash(updatePersonalInfo.password, 10);
        updatePersonalInfo.password = hashedNewPassword;
    }

    
    return await this.userRepository.save({...user,...updatePersonalInfo});
  }

  async findByEmail(email:string): Promise<User>{
    const user =  await this.userRepository.findOne({where: {email, isActive: true}});
    console.log(user)
    if(!user){
        throw new NotFoundException('Usuário não encontrado');
    }


    return user;
  }




}
