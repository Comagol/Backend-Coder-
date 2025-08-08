import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userCollection = 'users';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  last_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'carts'
  },
  role: {
    type: String,
    default: 'user'
  }
});

//middleware para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', function (next){
  if(!this.isModified('password')) return next();

  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

//metodo para comparar contraseñas
userSchema.methods.comparePassword = function (password){
  return bcrypt.compareSync(password, this.password);
}

export const userModel = mongoose.model(userCollection, userSchema);