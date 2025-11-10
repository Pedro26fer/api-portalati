import {PartialType} from '@nestjs/mapped-types';
import { CreateEventDto } from './createEvent.dto';
export class UpdateEventDto extends PartialType(CreateEventDto) {}