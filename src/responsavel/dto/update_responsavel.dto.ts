import {PartialType} from '@nestjs/mapped-types';
import { CreateResponsavelDto } from './create_responsavel.dto'; 

export class UpdateResponsavelDto extends PartialType(CreateResponsavelDto) {}