import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  reference: string;
}
