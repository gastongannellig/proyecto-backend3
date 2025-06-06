import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../products/entities/product.entity';

@Schema()
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ required: true })
  quantity: number;
}

@Schema({ versionKey: false })
export class Cart extends Document {
  @Prop([{ type: CartItem }])
  products: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);