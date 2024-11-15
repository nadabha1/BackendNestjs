import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';  

export type UserDocument = User & Document; 
@Schema()
export class User extends Document {

    
    @Prop({ required: true, unique: true })  // Adding unique constraint to email
    email: string;

    @Prop()
    password: string;

    @Prop()
    username: string;

    @Prop({ required: false })  // Optional OTP field for password reset
    otp: string;

    @Prop({ required: false })  // Optional OTP expiration field
    otpExpires: Date;
    @Prop()
    avatarUrl?: string;


}
export const UserSchema = SchemaFactory.createForClass(User);
