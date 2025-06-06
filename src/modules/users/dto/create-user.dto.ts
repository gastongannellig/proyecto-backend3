import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, MinLength, Min } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsString()
  @MinLength(2)
  first_name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsString()
  @MinLength(2)
  last_name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Edad del usuario',
    example: 25
  })
  @IsNumber()
  @Min(18)
  age: number;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Última conexión del usuario',
    example: new Date()
  })
  last_connection?: Date;

  @ApiProperty({
    description: 'Documentos del usuario',
    type: [Object],
    example: []
  })
  documents?: Array<{ name: string; reference: string }>;
}