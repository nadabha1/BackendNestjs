import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/entities/user.entity';
import { Projet } from 'src/projet/entities/projet.entity';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: ['To Do', 'Ongoing', 'Done', 'On Hold'] })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ type: Types.ObjectId, ref: 'Projet', required: true })
    projet: Projet;
}

export const TaskSchema = SchemaFactory.createForClass(Task);