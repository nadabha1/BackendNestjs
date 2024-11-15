import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  // Login endpoint
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);  // Call the login service method
  }
  @Post('loginA')
  async loginA(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);  // Call the login service method
  }


  @Get('get')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) { // id is a string
    return this.userService.findOne(id);
  }
  @Post('get-id')
async getUserId(@Body('username') username: string): Promise<{ id: string }> {

  return this.userService.findOneBy(username );; // Assuming `user._id` is the unique identifier
}
@Post('getuser')
async getUser(@Body('username') username: string) {
  return this.userService.findUserInfo(username); // Appelle la fonction pour trouver l'utilisateur par son nom d'utilisateur
}

@Patch('update')
update(@Body() updateUserDto: UpdateUserDto) {
  return this.userService.update(updateUserDto.idUser, updateUserDto);
}

  @Patch('update/:id')  // Exemple d'URL: /user/update/:id
  async updateProfile(
    @Param('id') userId: string,
    @Body() updateUserProfileDto:UpdateUserDto
  ) {
    return this.userService.updateProfile(userId, updateUserProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { // id is a string
    return this.userService.remove(id);
  }
// Forgot password - generate OTP
@Post('forgot-password')
async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  return this.userService.forgotPassword(forgotPasswordDto);  // Call forgotPassword instead
}

// Reset password with OTP
@Post('reset-password')
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return this.userService.verifyOtpAndResetPassword(resetPasswordDto);  // Call verifyOtpAndResetPassword
}
}
