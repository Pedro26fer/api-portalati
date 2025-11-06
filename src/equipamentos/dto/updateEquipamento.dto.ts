import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipamentoDto } from './createEquipamento.dto';

export class UpdateEquipamentoDto extends PartialType(CreateEquipamentoDto) {}
