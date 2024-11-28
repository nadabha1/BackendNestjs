import { IsEmail } from 'class-validator';

export class GetUserProfileDto {
  //@IsEmail()
  email: string;
}
