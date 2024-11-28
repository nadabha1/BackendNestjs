import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjetDocument = Projet & Document;

@Schema()
export class Projet extends Document {

    @Prop({ required: true, unique: true }) // Title with unique constraint
    title: string;

    @Prop({ required: true }) // Description is required
    description: string;

    @Prop({ required: true }) // Technologies used in the project
    technologies: string;

    @Prop({ required: true }) // Optional budget field
    budget: string;

    @Prop({ required: true }) // Optional duration field
    duration: Date;

    @Prop({ required: true, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' }) // Status field with default value
    status: string;
    @Prop({ required: true}) // Status field with default value
    userId: string;
}

export const ProjetSchema = SchemaFactory.createForClass(Projet);
