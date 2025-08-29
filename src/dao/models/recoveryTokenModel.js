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

