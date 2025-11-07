import { Controller, ForbiddenException, Req, Request, UseGuards } from "@nestjs/common";
import {Post, Get, Param, Delete, Body, Patch} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUsuarioDto } from "./dto/createUsuarioDto.dto";
import { UpdateUserDTO } from "./dto/updateUsuarioDto.dto";
import { User } from "./user.entity";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('sign_up')
    async createUser(@Body() createUsuarioDto: CreateUsuarioDto): Promise<User>{
        return this.userService.createUser(createUsuarioDto);
    }

    @Get('all')
    async getAllUsers(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getUserById(@Request() req: any): Promise<User> {
        const id = req.user.id;
        return this.userService.getUserById(id);
    }

    @Get('search_for_email')
    async findByEmail(@Body('email') email: string): Promise<User>{
        return this.userService.findByEmail(email);
    }

    @Patch('inactivate/:id')
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuthGuard('jwt'))
    async inactivateUser(@Param('id') id: string, @Request() req: any): Promise<void> {
        if(req.user.id !== id){
            throw new ForbiddenException('Você não tem autorização para editar esse perfil')
        }
        return this.userService.inactivateUser(id);
    }

    @Patch('update-last-access/:id')
    async updateLastAccess(
    @Param('id') id: string,
    @Body('dataLocal') dataLocal?: string
    ) {
        return this.userService.updateLastAccess(id, dataLocal);
    }

    @Patch('activate/:id')
    @UseGuards(JwtAuthGuard)
    async activateUser(@Param('id') id: string) : Promise<void>{
        await this.userService.activateUser(id);
    }
    

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Param('id') id: string): Promise<void> {
        await this.userService.deleteUser(id);
    }

    @Patch('update-personal-info/:id')
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuthGuard('jwt'))
    async updatePersonalInfo(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO, @Request() req: any): Promise<User> {
        if(req.user.id !== id ){
            throw new ForbiddenException('Você não tem autorização para editar esse perfil')
        }
        return this.userService.updatePersonalInfo(id, updateUserDto);
    }


}