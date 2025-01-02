import {IsNotEmpty, IsEmail, MinLength, IsString, IsOptional } from 'class-validator';


export class CreateUserC {


    @IsString()
    @IsOptional()
    avatarUrl?: string;
    
    @IsString()
    @IsOptional()
    username: string;
    
    @IsString()
    @IsOptional()
    dateOfBirth: string;
    @IsString()
    @IsOptional()
    country: string;

    @IsString()
    @IsOptional()
    cv?: string;

    @IsString()
    @IsOptional()
    skills?: string;
    

}
