import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MocksController } from './mocks.controller';
import { MocksService } from './mocks.service';
import { User, UserSchema } from '../users/entities/user.entity';
import { Pet, PetSchema } from '../pets/entities/pet.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Pet.name, schema: PetSchema }
    ])
  ],
  controllers: [MocksController],
  providers: [MocksService],
  exports: [MocksService] 
})
export class MocksModule {}