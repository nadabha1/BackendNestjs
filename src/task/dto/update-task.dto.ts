import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['To Do', 'Ongoing', 'Done', 'On Hold'], { message: 'Status must be To Do, Ongoing, Done, or On Hold' })
    @IsOptional()
    status?: string;
}
