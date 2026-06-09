import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  chatId: { 
    type: String, 
    enum: ['user', 'agent'], 
    required: true 
  },
  userId: { 
    type: String, 
    required: true 
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// This prevents Mongoose from recompiling the model if it's already registered
export const Message = mongoose.models.Chat || mongoose.model('Message', chatSchema);