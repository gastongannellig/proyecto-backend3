import { expect } from 'chai';
import supertest from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import config from '../config/config.js';

const request = supertest(app);

describe('Pets Mock Testing', function() {
  this.timeout(10000);

  before(async () => {
    try {
      await mongoose.connect(config.MONGO_URI);
      console.log('Test DB Conectado');
    } catch (error) {
      console.error('Error conectando a la test database:', error);
      throw error;
    }
  });

  after(async () => {
    await mongoose.connection.close();
    console.log('Test DB Desconectado');
  });

  describe('GET /api/mocks/mockingpets', () => {
    it('Deberá retornar 10 mock pets por defecto', async () => {
      const response = await request.get('/api/mocks/mockingpets');
      
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(10);
      
      const firstPet = response.body.payload[0];
      expect(firstPet).to.have.property('_id');
      expect(firstPet).to.have.property('name');
      expect(firstPet).to.have.property('species');
      expect(firstPet.species).to.be.oneOf(['cat', 'dog', 'bird']);
      expect(firstPet).to.have.property('age');
      expect(firstPet.age).to.be.within(1, 15);
    });
  });
});