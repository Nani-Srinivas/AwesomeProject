import mongoose, { Schema, model } from 'mongoose';

const CounterSchema = new Schema({
  modelName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  sequenceValue: { 
    type: Number, 
    default: 1 
  }
}, { timestamps: true });

export default model('Counter', CounterSchema);