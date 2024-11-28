import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, HttpException, HttpStatus, Put,Query, BadRequestException  } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { CreateUserC } from './dto/CreateUserCont.dto';
import { GetUserProfileDto } from './dto/get-user-profile.dto';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
 

  @Put('update-role')
async updateRole(@Body() updateRoleRequest: { role: string; userId: string }) {
    const { role, userId } = updateRoleRequest;
    await this.userService.updateUserRole(userId, role);
    console.log(`Updating role for user: ${userId} to role: ${role}`);
    return { success: true, role };
}

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  // Login endpoint
  @Post('login')
async login(@Body() loginDto: LoginDto) {
  try {
    return await this.userService.login2(loginDto); // Call the login service method
  } catch (error) {
    throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


@Post('refresh')
async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
  return this.userService.refreshTokens(refreshTokenDto.refreshToken);
}
  @Post('loginA')
  async loginA(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);  // Call the login service method
  }


  @Get('get')
  findAll() {
    return this.userService.findAll();
  }


  @Post('get-id')
async getUserId(@Body('username') username: string): Promise<{ id: string }> {

  return this.userService.findOneBy(username );; // Assuming `user._id` is the unique identifier
}
@Post('getuserId')
async getUserID(@Body('username') username: string) {
  return this.userService.findByEmailOrUsername(username); // Appelle la fonction pour trouver l'utilisateur par son nom d'utilisateur
}
@Post('getuser')
async getUser(@Body('username') username: string) {
  return this.userService.findByEmailOrUsername2(username); // Appelle la fonction pour trouver l'utilisateur par son nom d'utilisateur
}


@Patch('update')
update(@Body() updateUserDto: UpdateUserDto) {
  return this.userService.update(updateUserDto.idUser, updateUserDto);
}
@Patch('createProfile')
createProfile(@Body() updateUserDto: CreateUserC) {
  return this.userService.updateC(updateUserDto.username, updateUserDto);
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

@Get('profile')
async getUserProfile(@Query('email') email: string): Promise<Partial<User>> {
    console.log('Email received:', email); // Debug log
    if (!email) {
        throw new BadRequestException('Email query parameter is required');
    }

    const user = await this.userService.getUserProfile(email);
    if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
    }

    
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        country: user.country,
        role: user.role,
    };
}

@Post('getnameRole')
async getRoleNameByID(@Body('id') id: string) {
  return this.userService.getRole(id);
}

@Post('getIdRole')
async getRoleNameByUserID(@Body('id') id: string) {
  return this.userService.getRoleByUserId(id);
}

}
