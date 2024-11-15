  import { Injectable, NotFoundException } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { User, UserDocument } from './entities/user.entity';
  import * as bcrypt from 'bcrypt';  // for password hashing
  import { LoginDto } from './dto/login.dto';  // Import the login DTO
  import { JwtService } from '@nestjs/jwt';  // for JWT token generation
  import * as nodemailer from 'nodemailer';
  import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
  import { ResetPasswordDto } from './dto/ResetPasswordDto';
  import { HttpException, HttpStatus } from '@nestjs/common';

  @Injectable()
  export class UserService {

    constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
      private readonly jwtService: JwtService,  // Inject JwtService for JWT generation
    ) { }

    // Create a new user
    async create(createUserDto: CreateUserDto): Promise<User> {
      // Check if the email already exists
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
      if (existingUser) {
        throw new Error('Email is already taken');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      createUserDto.password = hashedPassword;

      // Create a new user and save to the database
      const createdUser = new this.userModel(createUserDto);  // Use the user model
      return await createdUser.save();  // Save the user
    }


async login2(loginDto: LoginDto): Promise<{ access_token: string }> {
  const { username, password } = loginDto;

  // Vérifier si l'utilisateur existe
  const user = await this.userModel.findOne({ username }).exec();
  if (!user) {
    throw new HttpException(
      { message: 'Invalid username' },
      HttpStatus.UNAUTHORIZED
    );
  }

  // Comparer le mot de passe fourni avec le mot de passe haché en base de données
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpException(
      { message: 'Invalid password' },
      HttpStatus.UNAUTHORIZED
    );
  }

  // Générer un JWT token
  const payload = { email: user.email, sub: user._id };
  const access_token = this.jwtService.sign(payload);
  return { access_token };
}
    // Login user and return JWT token
    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
      const { username, password } = loginDto;

      // Check if the user exists
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        throw new Error('Invalid email ');
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid  password '+ password);
      }
  
      // Generate a JWT token
      const payload = { email: user.email, sub: user._id };  // You can include any user details here
      const access_token = this.jwtService.sign(payload);  // Generate JWT token
      return { access_token };

    }

    async findAll(): Promise<User[]> {
      return await this.userModel.find().exec(); // Retrieve all users from MongoDB
    }

    async findOne(id: string): Promise<User> {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException('User with this ID not found');
      }
      return user;
    }
    async findOneBy(username: string): Promise<{ id: string }> {
      const user = await this.userModel.findOne({ username }).exec();
      
      if (!user) {
        throw new NotFoundException('User with this ID not found');
      }
    
      return { id: user._id.toString() }; 
    }
    async findUserInfo(username: string): Promise<{ id: string, email: string, username: string }> {
      const user = await this.userModel.findOne({ username }).exec();
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      return {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      };
    }
    
    async updateProfile(username: string, updateUserProfileDto: UpdateUserDto) {
      // Exemple : Mettez à jour les informations de l'utilisateur dans la base de données
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        throw new Error('User not found');
      }
      user.username = updateUserProfileDto.username || user.username;
      user.avatarUrl = updateUserProfileDto.avatarUrl || user.avatarUrl;
      const updatedUser = await this.userModel.findByIdAndUpdate(user._id, updateUserProfileDto, { new: true }).exec();
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;    
    }
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    }

    async remove(id: string): Promise<User> {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException('User not found');
      }
      return deletedUser;
    }
   // Forgot Password: Generate OTP and send email
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ otp: string }> {
    const { username } = forgotPasswordDto;
    
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ribd1920@gmail.com',
        pass: 'otpd ybir gpwb avzp', // Use your Gmail App Password if 2FA is enabled
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP for resetting your password is ${otp}. It is valid for 10 minutes.`,
    });

    return { otp };  
  }

  // Verify OTP and Reset Password
  async verifyOtpAndResetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ newPassword: string }> {
    const { username, otp, newPassword } = resetPasswordDto;
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      throw new Error('Invalid or expired OTP');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { newPassword };  
  }

    
  }
