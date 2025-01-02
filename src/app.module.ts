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
import { ApplicationModule } from './application/application.module';
import { NotificationModule } from './notification/notification.module';
import { TaskModule } from './task/task.module';
import { StripeModule } from './stripe/stripe.module';
import config from './config/config';
import { WebsocketsModule } from './websockets/websockets.module';


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
    ApplicationModule,
    NotificationModule,
    TaskModule,
    StripeModule,
    WebsocketsModule,
  

  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
