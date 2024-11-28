
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsDate, IsEnum } from 'class-validator';

export class CreateProjetDto {

    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description: string;

    @IsString()
    @IsNotEmpty({ message: 'Technologies are required' })
    technologies: string;

    @IsString()
    @IsNotEmpty() 
    budget: string;

    @IsDate()
    @IsNotEmpty() 
    @Type(() => Date)
    duration: Date;

    @IsEnum(['To Do', 'In Progress', 'Completed'], { message: 'Status must be one of: pending, in-progress, completed' })
    @IsNotEmpty({ message: 'Status is required' })
    status: string;
    @IsString()
    @IsNotEmpty() 
    userId: string;
}
