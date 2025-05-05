import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  species: { 
    type: String, 
    required: true,
    enum: ['cat', 'dog', 'bird'] // Limitamos las especies permitidas
  },
  age: { 
    type: Number, 
    required: true,
    min: 0
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Pet', petSchema);