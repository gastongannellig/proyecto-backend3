import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pet extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['cat', 'dog', 'bird'] })
  species: string;

  @Prop({ required: true })
  age: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PetSchema = SchemaFactory.createForClass(Pet);