import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { UsersModule } from './modules/users/users.module';
import { winstonConfig } from './modules/logger/winston.config';
import { PetsModule } from './modules/pets/pets.module';
import { ProductsModule } from './modules/products/products.module';
import { CartsModule } from './modules/carts/carts.module';
import { AuthModule } from './modules/auth/auth.module';
import { MocksModule } from './modules/mocks/mocks.module';
import { Product, ProductSchema } from './modules/products/schemas/product.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'test'}`,
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/your-db',
      }),
    }),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    UsersModule,
    PetsModule,
    ProductsModule,
    CartsModule,
    AuthModule,
    MocksModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}
