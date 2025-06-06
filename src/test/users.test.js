import { expect } from 'chai';
import supertest from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import config from '../config/config.js';

const request = supertest(app);

describe('Users Mock Testing', function() {
  // Aumentar el timeout a 10 segundos
  this.timeout(10000);

  // Antes de todos los tests
  before(async () => {
    // Asegurar conexión a MongoDB
    try {
      await mongoose.connect(config.MONGO_URI);
      console.log('Test DB Conectado');
    } catch (error) {
      console.error('Error conectando a la test database:', error);
      throw error;
    }
  });

  // Después de todos los tests
  after(async () => {
    await mongoose.connection.close();
    console.log('Test DB Desconectado');
  });

  describe('GET /api/mocks/mockingusers', () => {
    it('Deberá retornar 50 mock users por defecto', async () => {
      const response = await request.get('/api/mocks/mockingusers');
      
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(50);
      
      const firstUser = response.body.payload[0];
      expect(firstUser).to.have.property('_id');
      expect(firstUser).to.have.property('firstName');
      expect(firstUser).to.have.property('lastName');
      expect(firstUser).to.have.property('email');
      expect(firstUser).to.have.property('password');
      expect(firstUser).to.have.property('role');
      expect(firstUser.role).to.be.oneOf(['user', 'admin']);
      expect(firstUser.pets).to.be.an('array').that.is.empty;
    });
  });
});