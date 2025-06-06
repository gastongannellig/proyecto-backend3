import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/services/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  
  const testUser = {
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User',
    age: 25
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));
    usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await usersService.create({
      ...testUser,
      password: hashedPassword,
    });
  });

  afterAll(async () => {
    // Limpiar usuario de prueba
    await usersService.removeByEmail(testUser.email);
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('debería devolver un token JWT y estado 200 cuando las credenciales son correctas', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('debería devolver estado 401 cuando las credenciales son incorrectas', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'contraseñaIncorrecta',
        })
        .expect(401);
    });

    it('debería devolver estado 401 cuando el usuario no existe', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'cualquierContraseña',
        })
        .expect(401);
    });
  });
});