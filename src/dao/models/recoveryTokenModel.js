import mongoose from "mongoose";
import crypto from "crypto";

const recoveryTokenCollection = 'recoveryTokens';

const recoveryTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt:{
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
});

// Middleware para generar token antes de guardar
recoveryTokenSchema.pre('save', function(next) {
  if (!this.token) {
      // Genero token único
      this.token = crypto.randomBytes(32).toString('hex');
  }
  if (!this.expiresAt) {
      // Token expira en 1 hora
      this.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  }
  next();
});

// metodo para verificar si el token es valido
recoveryTokenSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

export const recoveryTokenModel = mongoose.model(recoveryTokenCollection, recoveryTokenSchema);