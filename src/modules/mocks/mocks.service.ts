import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MocksService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Pet.name) private petModel: Model<Pet>,
  ) {}

  generateMockUser() {
    const hashedPassword = bcrypt.hashSync('coder123', 10);
    
    return {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 99 }),
      password: hashedPassword,
      role: faker.helpers.arrayElement(['user', 'admin']),
      cart: null,
      pets: [],
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }

  generateMockPet() {
    return {
      name: faker.animal.cat(),
      species: faker.helpers.arrayElement(['cat', 'dog', 'bird']),
      age: faker.number.int({ min: 1, max: 15 }),
      owner: null,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }

  async generateMockData(users: number, pets: number) {
    try {
      const mockUsers = Array.from({ length: users }, () => this.generateMockUser());
      const mockPets = Array.from({ length: pets }, () => this.generateMockPet());

      const savedUsers = await this.userModel.insertMany(mockUsers);
      const savedPets = await this.petModel.insertMany(mockPets);

      return {
        usersGenerated: savedUsers.length,
        petsGenerated: savedPets.length,
        message: 'Datos generados e insertados correctamente'
      };
    } catch (error) {
      console.error('Error generando datos:', error);
      throw new InternalServerErrorException(
        `Error generando datos mock: ${error.message}`
      );
    }
  }
}