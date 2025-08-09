import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from '../dao/models/userModel.js';
import { cartModel } from '../dao/models/cartModel.js';
import { passport, jwt } from '../config/passport.config.js';

//inicializo el router
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, age } = req.body;
    //valido los campos requeridos
    if(!first_name || !last_name || !email || !password || !age) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos los campos son requeridos'
      });
    }
    //valido si el usuario ya existe en la base de datos
    const existingUser = await userModel.findOne({ email });
    if(existingUser) {
      return res.status(400).json({
        status: 'erros',
        message: 'El email ya esta registrado'
      });
    }

    //Creo el carrito del usuario
    const newCart = new cartModel({
      products: []
    });

    // creo al nuevo usuario
    const newUser = new userModel({
      first_name,
      last_name,
      email,
      password,
      age,
      cart: newCart._id
    });

    //guardo el usuario y el carrito
    await newUser.save();

    //genero el token JWT
    const token = jwt.sign(
      {userId: newUser._id},
    JWT_SECRET,
    {expiresIn: '4h'}
  );

  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado correctamente',
    token,
    user: {
      id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      age: newUser.age,
      cart: newUser.cart
    }
  });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
});


