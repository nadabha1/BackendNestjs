import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Role extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ resource: String, actions: [String] }], default: [] })
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
