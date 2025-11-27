import { IsString, IsOptional, IsDate, IsEmail } from "class-validator";


export class CreateEventDto {

    @IsString({message: 'A data inicial deve ser uma string'})
    start!: string;

    @IsString({message: 'A data final deve ser uma string'})
    end!: string;

    @IsString({message: 'A tag deve ser uma string'})
    tag!: string;

    @IsOptional()
    @IsEmail({}, {message: 'O email do técnico deve ser um email válido'})
    tecnicoEmail!: string;

    @IsString({message: "O nome do técnico de campo deve ser uma string"})
    tecnicoCampo!: string;

    @IsString({message: 'O cliente deve ser uma string'})
    cliente!: string;

    @IsString({message: 'A usina deve ser uma string'})
    usina!: string;

    @IsOptional()
    @IsString({message: 'O status deve ser uma string'})
    status!: string;

    @IsString({message: 'O equipamento deve ser uma string'})
    equipamento!: string;

    @IsOptional()
    @IsString({message: 'A descrição deve ser uma string'})
    description?: string;
}