import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Determina la ruta de destino según el campo del formulario
      // 'documents' para documentos y 'pets' para imágenes de mascotas
      let uploadPath = './uploads/';
      
      if (file.fieldname === 'documents') {
        uploadPath += 'documents/';
      } else if (file.fieldname === 'pets') {
        uploadPath += 'pets/';
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Crea un nombre de archivo único usando la fecha actual y un número aleatorio
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Validación del tipo de archivo según el campo del formulario
    if (file.fieldname === 'documents') {
      if (!file.originalname.match(/\.(pdf|doc|docx|txt)$/)) {
        return cb(new Error('Solo se permiten archivos PDF, DOC, DOCX o TXT'), false);
      }
    } else if (file.fieldname === 'pets') {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Solo se permiten imágenes JPG, JPEG o PNG'), false);
      }
    }
    cb(null, true);
  }
};