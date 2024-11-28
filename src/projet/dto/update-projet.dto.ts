import { PartialType } from '@nestjs/mapped-types';
import { CreateProjetDto } from './create-projet.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjetDto extends PartialType(CreateProjetDto) {
    @IsOptional() // Facultatif (ne sera pas requis dans la requête)
    @IsString()   // Doit être une chaîne de caractères
    id?: string;
}

