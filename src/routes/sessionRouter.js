import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from '../dao/models/userModel.js';
import { cartModel } from '../dao/models/cartModel.js';
import { passport, jwt } from '../config/passport.config.js';
import e from 'express';

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

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    //extraigo las credenciales del body
    const { email, password } = req.body;
    //valido si los campos requeridos se enviaron
    if(!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y password son requeridos'
      });
    }
    //busco al usuario en la base de datos mediante el email
    const user = await userModel.findOne({ email });
    //valido si el usuario existe
    if(!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales invalidas'
      });
    }
    //verifico la contraseña usando el metodo comparePassword
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Credenciales invalidas'
      });
    }

    //genero el token JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    //respuesta exitosa con el token y el usuario
    res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        cart: user.cart
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

//Ruta Current
router.get('/current', 
  passport.authenticate('current', { session: false }), 
  (req, res ) => {
    try {
      if(!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'No autorizado'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Usuario autenticado correctamente',
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener el usuario autenticado',
        error: error.message
      });
    }
});

export default router;