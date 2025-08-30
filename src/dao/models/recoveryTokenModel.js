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
    required: true,
    unique: true,
    default: function() {
        // Generar token único
        return crypto.randomBytes(32).toString('hex');
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
        // Token expira en 1 hora
        return new Date(Date.now() + 60 * 60 * 1000);
    }
  },
  used: {
    type: Boolean,
    default: false
  }
});

// Metodo para verificar si el token es valido
recoveryTokenSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

export const recoveryTokenModel = mongoose.model(recoveryTokenCollection, recoveryTokenSchema);