import { Controller, Get, Post, Body } from '@nestjs/common';
import { MocksService } from './mocks.service';
import { GenerateDataDto } from './dto/generate-data.dto';

@Controller('mocks')
export class MocksController {
  constructor(private readonly mocksService: MocksService) {}

  @Get('mockingusers')
  generateMockUsers() {
    const users = Array.from({ length: 50 }, () => this.mocksService.generateMockUser());
    return {
      status: 'success',
      payload: users,
      count: users.length,
    };
  }

  @Get('mockingpets')
  generateMockPets() {
    const pets = Array.from({ length: 10 }, () => this.mocksService.generateMockPet());
    return {
      status: 'success',
      payload: pets,
      count: pets.length,
    };
  }

  @Post('generateData')
  async generateData(@Body() generateDataDto: GenerateDataDto) {
    return {
      status: 'success',
      payload: await this.mocksService.generateMockData(
        generateDataDto.users,
        generateDataDto.pets
      ),
    };
  }
}