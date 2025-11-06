import { IsString, IsNumber, IsOptional, IsNotEmpty } from "class-validator";
import { Usina } from "src/usina/usina.entity";
import { Equipamentos } from "../equipamentos.entity";

export class CreateEquipamentoDto {

    @IsNotEmpty({message: 'O nome do equipamento é obrigatório.'})
    @IsString({message: 'O nome do equipamento deve ser uma string.'})
    nome!: string;

    @IsOptional()
    @IsString({message: 'O apelido do equipamento deve ser uma string.'})
    apelido?: string;

    @IsNotEmpty({message: 'A descrição do equipamento é obrigatória.'})
    @IsString({message: 'A descrição do equipamento deve ser uma string.'})
    descricao!: string;

    @IsNotEmpty({message: 'O número de série do equipamento é obrigatório.'})
    @IsNumber({}, {message: 'O número de série do equipamento deve ser um número.'})
    numSerie!: number;

    @IsOptional()
    @IsNumber({}, {message: 'O número de portas disponíveis deve ser um número.'})
    portasDisponiveis?: number;

    @IsNotEmpty({message: 'A versão do equipamento é obrigatória.'})
    @IsString({message: 'A versão do equipamento deve ser uma string.'})
    versao!: string;

    @IsNotEmpty({message: 'O IP local do equipamento é obrigatório.'})
    @IsString({message: 'O IP local do equipamento deve ser uma string.'})
    ipLocal!: string;   

    @IsNotEmpty({message: 'A usina do equipamento é obrigatória.'})
    @IsString({message: 'O nome da usina do equipamento deve ser uma string.'})
    usina!: string;

    @IsOptional()
    @IsNumber({}, { message: 'O número de série do equipamento pai deve ser um número.' })
    equipamento_pai?: number;



}