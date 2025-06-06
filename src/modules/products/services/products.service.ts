import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async findAll(query?: any): Promise<Product[]> {
    const filter = {};
    
    if (query) {
      if (query.category) {
        filter['category'] = query.category;
      }
      if (query.status !== undefined) {
        filter['status'] = query.status;
      }
    }

    return this.productModel.find(filter)
      .limit(query?.limit || 10)
      .skip(query?.page ? (query.page - 1) * (query?.limit || 10) : 0)
      .sort(query?.sort ? { price: query.sort === 'asc' ? 1 : -1 } : {})
      .exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id, 
      updateProductDto, 
      { new: true }
    ).exec();
    
    if (!updatedProduct) {
      throw new NotFoundException('Producto no encontrado');
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException('Producto no encontrado');
    }
    return deletedProduct;
  }
}