import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'agent'], 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    enum: ['liked', 'disliked', 'none'], 
    default: 'none' 
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// This prevents Mongoose from recompiling the model if it's already registered
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);