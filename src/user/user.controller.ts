import {
  Controller,
  ForbiddenException,
  Request,
  UseGuards,
  // Decoradores e exceções necessários:
  Post,
  Get,
  Param,
  Delete,
  Body,
  Patch,
  Query, // 👈 Agora importado corretamente
  BadRequestException, // 👈 Importado para melhor tratamento de erros
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUsuarioDto } from './dto/createUsuarioDto.dto';
import { UpdateUserDTO } from './dto/updateUsuarioDto.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { TechnicianAvailability } from './user.service';
import { FormattedTechnicianAvailability } from './user.service';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post('sign_up')
  async createUser(@Body() createUsuarioDto: CreateUsuarioDto): Promise<User> {
    return this.userService.createUser(createUsuarioDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('all')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get('usuarios_ati')
  @UseGuards(JwtAuthGuard)
  async getUsersAti(): Promise<User[]> {
    return this.userService.getUserAti();
  } // Rota: GET /user/availability?tag=suporte&data=2025-11-25

  @Get('availability')
  async getTeamAvailability(
    @Query('tag') tag: string,
    @Query('data') dataString: string,
  ): Promise<FormattedTechnicianAvailability[]> {
    // 👈 Mudança no tipo de retorno para o formato formatado
    // Validação que garante que ambos os parâmetros foram fornecidos
    if (!tag || !dataString) {
      // Usando BadRequestException para retornar erro HTTP 400
      throw new BadRequestException(
        'A tag da equipe e a data são obrigatórias para consultar a disponibilidade.',
      );
    } // Chama a função do serviço

    return this.userService.getAvaibleTimesPerTeam(tag, dataString);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMyUser(@Request() req: any): Promise<User> {
    const id = req.user.id;
    return this.userService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('profileById/:id')
  async getUserById(@Param("id") id: string ): Promise<User> {
    return this.userService.getUserById(id);
  }


  @Get('search_for_email')
  async findByEmail(@Body('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Patch('inactivate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async inactivateUser(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    // if (req.user.id !== id) {
    //   throw new ForbiddenException(
    //     'Você não tem autorização para editar esse perfil',
    //   );
    // }
    return this.userService.inactivateUser(id);
  }

  @Patch('update-last-access/:id')
  async updateLastAccess(
    @Param('id') id: string,
    @Body('dataLocal') dataLocal?: string,
  ) {
    return this.userService.updateLastAccess(id, dataLocal);
  }

  @Patch('activate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async activateUser(@Param('id') id: string): Promise<void> {
    await this.userService.activateUser(id);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Patch('update-personal-info')
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  async updatePersonalInfo(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    const id = req.user.id;
    if (req.user.id !== id) {
      throw new ForbiddenException(
        'Você não tem autorização para editar esse perfil',
      );
    }
    return this.userService.updatePersonalInfo(id, updateUserDto);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    return this.userService.updatePersonalInfo(id, updateUserDto);
  }

}
