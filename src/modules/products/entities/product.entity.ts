import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  thumbnails: string[];

  @Prop({ default: true })
  status: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);