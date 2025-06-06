import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Smartphone XYZ',
    description: 'Nombre del producto',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  title: string;

  @ApiProperty({
    example: 'Smartphone de última generación con características premium',
    description: 'Descripción detallada del producto',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description: string;

  @ApiProperty({
    example: 999.99,
    description: 'Precio del producto',
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @ApiProperty({
    example: 'Electrónicos',
    description: 'Categoría del producto',
  })
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  category: string;

  @ApiProperty({
    example: 100,
    description: 'Cantidad disponible del producto',
  })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @ApiProperty({
    example: ['https://ejemplo.com/imagen.jpg'],
    description: 'URLs de las imágenes del producto',
    required: false,
  })
  @IsOptional()
  @IsString({ each: true, message: 'Las imágenes deben ser cadenas de texto' })
  thumbnails?: string[];
}
