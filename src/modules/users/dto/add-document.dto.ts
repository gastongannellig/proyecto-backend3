import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddDocumentDto {
  @ApiProperty({
    description: 'Nombre del documento',
    example: 'DNI'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Link al documento',
    example: 'https://ejemplo.com/documento.pdf'
  })
  @IsString()
  @IsUrl()
  reference: string;
}
