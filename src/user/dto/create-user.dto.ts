import {IsNotEmpty, IsEmail, MinLength, IsString } from 'class-validator';


export class CreateUserDto {

    
   //@IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
     email: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 6 characters long' })
    password: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    username: string;

    @IsString()
     avatarUrl?: string;
    // @IsString()
    // cv?: string;
    
    @IsString()
    role?: string;
    


}
