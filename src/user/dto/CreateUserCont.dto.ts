import {IsNotEmpty, IsEmail, MinLength, IsString } from 'class-validator';


export class CreateUserC {


    @IsString()
    avatarUrl?: string;
    // @IsString()
    // cv?: string;
    
    @IsString()
    username: string;
    
    @IsString()
    dateOfBirth: string;
    @IsString()
    country: string;

    @IsString()
    cv?: string;

    @IsString()
    skills?: string;
    

}
