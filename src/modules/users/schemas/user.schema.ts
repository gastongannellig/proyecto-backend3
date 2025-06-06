import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';
import { Document } from './document.schema';

@Schema({ timestamps: true })
export class User extends MongooseDocument {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  age: number;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ type: [{ name: String, reference: String }], default: [] })
  documents: Document[];

  @Prop({ type: Date, default: Date.now })
  last_connection: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
