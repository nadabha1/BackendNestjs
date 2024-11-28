  import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { isValidObjectId, Model, ObjectId, Types } from 'mongoose';
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
  import { v4 as uuidv4 } from 'uuid';
  import { RefreshToken } from './entities/refresh-token.schema';
import { ResetToken } from './entities/reset-token.schema';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/schemas/role.schema';

  @Injectable()
  export class UserService {

    constructor(
      private rolesService: RolesService,
      @InjectModel(Role.name) private roleModel: Model<Role>, // Inject Role model
      @InjectModel(RefreshToken.name)
      private RefreshTokenModel: Model<RefreshToken>,
      @InjectModel(ResetToken.name)
      private ResetTokenModel: Model<ResetToken>,
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
      private readonly jwtService: JwtService,  // Inject JwtService for JWT generation
    ) { }
    async assignRoleToUser(userId: string, name: string): Promise<User> {

        const role1 = await this.rolesService.getRoleByName(name); // Get the role with the name "Freelancer"
        const roleId= role1._id;
      

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      const role = await this.roleModel.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      await this.userModel.findByIdAndUpdate(
        userId,
        { role: role._id })
  
     return user.save();
    }
    async getUserWithRole(userId: string): Promise<User> {
      return this.userModel.findById(userId).populate('role').exec(); // Populate the role details
    }
    async getRole(userId: string): Promise<{ role:String }> {
      const user = await this.userModel.findById(userId).exec(); // Populate the role details
      const roleid = user._id.toString();
      const role = await this.rolesService.getRoleNameById(roleid); 
      return { role: role.name };
    }
  
    async getRoleByUserId(userId: string): Promise<{idRole:String}> {
     
      const user = await this.userModel.findById(userId).exec(); // Populate the role details
      const roleid = user.role._id.toString();
      const name = await this.rolesService.getRoleNameById(roleid);

      return {idRole:name.name}
    }
    // Create a new user
    async create(createUserDto: CreateUserDto): Promise<User> {
      // Check if the email already exists
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
      if (existingUser) {
        throw new Error('Email is already taken');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      createUserDto.password = hashedPassword;

      const role = createUserDto.role;
      const role1 = await this.rolesService.getRoleByName(role); // Get the role with the name "Freelancer"
      createUserDto.role = role1._id.toString();
       if (!role) {
        throw new Error(`Role ${createUserDto.role || 'Freelancer'} not found`);
       }

      // Create a new user and save to the database
      const createdUser = new this.userModel(createUserDto);  // Use the user model
      return await createdUser.save();  // Save the user
    }
    async generateUserTokens(userId) {
      const accessToken = this.jwtService.sign({ userId }, { expiresIn: '6s' });
      const refreshToken = uuidv4();
  
      await this.storeRefreshToken(refreshToken, userId);
      return {
        accessToken,
        refreshToken,
      };
    }
    async storeRefreshToken(token: string, userId: string) {
      // Calculate expiry date 3 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 3);
  
      await this.RefreshTokenModel.updateOne(
        { userId },
        { $set: { expiryDate, token } },
        {
          upsert: true,
        },
      );
    }
    
  async getUserPermissions(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) throw new BadRequestException();

    const role = await this.rolesService.getRoleById(user.role.toString());
    return role.permissions;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string ,id:string,username:string}> {
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
    const id = user._id.toString();
      return { access_token , id,username: user.username};

  }
    // Login user and return JWT token
  

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
    

    async findAll(): Promise<User[]> {
      return await this.userModel.find().exec(); // Retrieve all users from MongoDB
    }

    async findByEmailOrUsername(identifier: string): Promise<{ id: string }> {
      // Recherche l'utilisateur par email ou username
      const user = await this.userModel
        .findOne({ $or: [{ email: identifier }, { username: identifier }] })
        .exec();
    
      if (!user) {
        throw new NotFoundException('User with this email or username not found');
      }
    
      return { id: user._id.toString() };
    }
    async findByEmailOrUsername2(identifier: string): Promise<{ user: User}> {
      // Recherche l'utilisateur par email ou username
      const user = await this.userModel
        .findOne({ $or: [{ email: identifier }, { username: identifier }] })
        .exec();
    
      if (!user) {
        throw new NotFoundException('User with this email or username not found');
      }
    
      return { user };
    }
    async getUserProfile(emailOrUsername: string): Promise<User> {
      const query = isValidObjectId(emailOrUsername)
          ? { _id: emailOrUsername }
          : { $or: [{ email: emailOrUsername }, { username: emailOrUsername }] };
  
      const user = await this.userModel.findOne(query).exec();
  
      if (!user) {
          throw new NotFoundException(`User with email or username ${emailOrUsername} not found`);
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
    async updateC(username: string, updateUserDto: UpdateUserDto): Promise<User> {
      const user = await this.userModel.findOne({ username : username });
      const updatedUser = await this.userModel.findByIdAndUpdate(user._id, updateUserDto, { new: true }).exec();
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
    
    const user = await this.userModel
    .findOne({ $or: [{ email: username }, { username: username }] })
    .exec();    if (!user) {
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

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userModel.findOne({ username : userId });
    if (!user) throw new NotFoundException('User not found');

    const role1 = await this.rolesService.getRoleByName(role); // Get the role with the name "Freelancer"

    user.role = role1;
    return user.save();
}

  }
