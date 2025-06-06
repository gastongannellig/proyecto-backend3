import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { AddDocumentDto } from '../dto/add-document.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByIdAndUpdate(id: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return updatedUser;
  }

  async removeByEmail(email: string) {
    return this.userModel.deleteOne({ email }).exec();
  }

  async addDocuments(userId: string, documents: Array<{ name: string; reference: string }>) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.documents = user.documents || [];
    user.documents.push(...documents);
    
    await user.save();
    return user;
  }
}
