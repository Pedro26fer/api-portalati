import {PartialType} from '@nestjs/mapped-types';
import { CreateUsinaDto } from './create-usina.dto'; 

export class UpdateUsinaDto extends PartialType(CreateUsinaDto) {}