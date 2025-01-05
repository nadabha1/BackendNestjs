import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional() // Facultatif (ne sera pas requis dans la requête)
    @IsString()   // Doit être une chaîne de caractères
    idUser?: string;
    username?: string
    avatarUrl?: string;
    role?: string;
    @IsString()
    @IsOptional()
    dateOfBirth?: string;
    @IsString()
    @IsOptional()
    country?: string;

}
