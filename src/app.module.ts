import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { CvAnalysisModule } from './cv-analysis/cv-analysis.module';
import { CvModule } from './cv/cv.module';
import { AiModule } from './ai/ai.module';
import { ProjetModule } from './projet/projet.module';
import { ProjectFilterModule } from './project-filter/project-filter.module';
import config from './config/config';


@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/ProjetM'),UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],

    }),
    RolesModule,
    UserModule,
    CvAnalysisModule,
    CvModule,
    AiModule,
    ProjetModule,
    ProjectFilterModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
