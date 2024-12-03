import { IsString } from "class-validator";

export class CreateApplicationDto {
    @IsString()
    freelancer: string;  // Référence au freelancer
    @IsString()
project: string;  // Référence au projet
@IsString()
status: string;  // Statut de la candidature
}