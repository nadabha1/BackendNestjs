import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';  // Import JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from 'src/roles/roles.module';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { RefreshToken, RefreshTokenSchema } from './entities/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from './entities/reset-token.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema }, // Importation du schema Role
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
    ]),
    RolesModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService,UserModule,MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
], // Uncomment this line to make the CvService available for other modules

})
export class UserModule {}
