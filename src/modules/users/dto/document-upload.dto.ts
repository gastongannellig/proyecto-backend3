import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentUploadDto {
  @ApiProperty({
    description: 'Tipo de documento',
    example: 'DNI'
  })
  @IsString()
  documentType: string;
}