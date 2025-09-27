import {PartialType} from '@nestjs/mapped-types';
import { CreateEntidadeDto } from './createEntidade.dto';

export class UpdateEntidadeDto extends PartialType(CreateEntidadeDto) {}