import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Cart } from '../../carts/entities/cart.entity';

interface UserDocument {
  name: string;
  reference: string;
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Cart', default: null })
  cart: Cart;

  @Prop({ default: 'user' })
  role: string;
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  last_connection: Date;

  @Prop({
    type: [{
      name: { type: String, required: true },
      reference: { type: String, required: true }
    }],
    default: []
  })
  documents: Array<{ name: string; reference: string }>;
}

export const UserSchema = SchemaFactory.createForClass(User);