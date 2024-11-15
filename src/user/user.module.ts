import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';  // Import JwtModule


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'your-secret-key',  // Use a more secure secret in production
      signOptions: { expiresIn: '1h' },  // Set token expiry (e.g., 1 hour)
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
