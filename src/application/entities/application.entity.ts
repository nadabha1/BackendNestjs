// src/applications/entities/application.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Projet } from 'src/projet/entities/projet.entity';
import { User } from 'src/user/entities/user.entity';

export type ApplicationDocument = Application & Document;

@Schema()
export class Application {
    @Prop({ type: String, ref: 'User' })
    freelancer: User;
  
    @Prop({ type: String, ref: 'Projet' })
    project: Projet;
  

  @Prop({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: string;  // Statut de la candidature
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
