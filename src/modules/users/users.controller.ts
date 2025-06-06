import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  NotFoundException,
  UseInterceptors, 
  UploadedFiles
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddDocumentDto } from './dto/add-document.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { DocumentUploadDto } from './dto/document-upload.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  @ApiOperation({ summary: 'Crear usuario', description: 'Crea un nuevo usuario en el sistema' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de usuario inválidos' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los usuarios', description: 'Retorna una lista de todos los usuarios registrados' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll() {
    return this.usersService.findAll();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener usuario por ID', description: 'Retorna los datos de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post(':id/documents')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Agregar documento', description: 'Agrega un nuevo documento al usuario' })
  @ApiResponse({ status: 201, description: 'Documento agregado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async addDocument(@Param('id') id: string, @Body() addDocumentDto: AddDocumentDto) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.usersService.findByIdAndUpdate(id, {
      documents: [...(user.documents || []), addDocumentDto]
    });
  }

  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('documents', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Lista de documentos para cargar',
    type: DocumentUploadDto
  })
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() documentUploadDto: DocumentUploadDto
  ) {
    const documents = files.map(file => ({
      name: documentUploadDto.documentType,
      reference: `documents/${file.filename}`
    }));

    return this.usersService.addDocuments(id, documents);
  }
}