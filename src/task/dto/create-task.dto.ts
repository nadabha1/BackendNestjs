import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    user: string;

    @IsString()
    @IsNotEmpty()
    projet: string;

    @IsEnum(['To Do', 'Ongoing', 'Done', 'On Hold'], { message: 'Status must be To Do, Ongoing, Done, or On Hold' })
    status: string;
}
