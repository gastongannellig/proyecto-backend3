import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

export const generateMockUser = () => {
  const hashedPassword = bcrypt.hashSync('coder123', 10);
  
  return {
    _id: faker.database.mongodbObjectId(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: hashedPassword,
    role: faker.helpers.arrayElement(['user', 'admin']),
    pets: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  };
};

export const generateMockPet = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    name: faker.animal.cat(),
    species: faker.helpers.arrayElement(['cat', 'dog', 'bird']),
    age: faker.number.int({ min: 1, max: 15 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  };
};