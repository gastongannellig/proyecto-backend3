import { Router } from 'express';
import { generateMockUser, generateMockPet } from '../utils/mockGenerator.js';
import User from '../models/user.model.js';
import Pet from '../models/pets.model.js';

const router = Router();

// GET /api/mocks/mockingusers - Genera 50 usuarios mock por defecto
router.get('/mockingusers', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 50;
    const users = Array.from({ length: count }, () => generateMockUser());
    res.json({ 
      status: 'success', 
      payload: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error generando usuarios mock:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET /api/mocks/mockingpets - Genera mascotas mock
router.get('/mockingpets', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const pets = Array.from({ length: count }, () => generateMockPet());
    res.json({ 
      status: 'success', 
      payload: pets,
      count: pets.length 
    });
  } catch (error) {
    console.error('Error generando mascotas mock:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// POST /api/mocks/generateData - Genera e inserta datos en la BD
router.post('/generateData', async (req, res) => {
  try {
    const { users = 0, pets = 0 } = req.body;

    // Validar parámetros
    if (!Number.isInteger(Number(users)) || !Number.isInteger(Number(pets)) || users < 0 || pets < 0) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Los parámetros users y pets deben ser números enteros positivos' 
      });
    }

    // Generar y guardar usuarios
    const generatedUsers = Array.from({ length: users }, () => generateMockUser());
    const savedUsers = await User.insertMany(generatedUsers);

    // Generar y guardar mascotas
    const generatedPets = Array.from({ length: pets }, () => generateMockPet());
    const savedPets = await Pet.insertMany(generatedPets);

    res.json({
      status: 'success',
      payload: {
        usersGenerated: savedUsers.length,
        petsGenerated: savedPets.length,
        message: 'Datos generados e insertados correctamente'
      }
    });
  } catch (error) {
    console.error('Error generando datos:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;