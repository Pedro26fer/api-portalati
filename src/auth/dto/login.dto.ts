import {IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator'

export class LoginDTO {
    @IsEmail({}, {message:'O email deve ser um email válido'})
    @IsNotEmpty({message: 'O campo não pode ser vazio'})
    email!: string

    @IsString({message: 'A senha deve ser uma string'})
    @IsNotEmpty({message: 'Você deve fornecer uma senha'})
    password!: string

    @IsString()
    @IsOptional()
    dataLocal?: string
}
