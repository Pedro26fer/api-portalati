import {PartialType} from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './createUsuarioDto.dto';

export class UpdateUserDTO extends PartialType(CreateUsuarioDto) {}