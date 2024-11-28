import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';  
import { Role } from 'src/roles/schemas/role.schema';

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
    @Prop({ type: Types.ObjectId, ref: 'Role', default: null }) // Reference to the Role schema
    role: Role ;
    @Prop({ required: false })  // Optional OTP expiration field
    dateOfBirth: string;
    @Prop({ required: false })  // Optional OTP expiration field
    country: string;
    @Prop({ required: false })  // Optional OTP expiration field
    skills: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
