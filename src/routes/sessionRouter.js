import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from '../dao/models/userModel.js';
import { cartModel } from '../dao/models/cartModel.js';
import { UserDTO } from '../dao/dto/userDTO.js';
import { UserUtils } from '../utils/userUtils.js';

//inicializo el router
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'contraseña_secreta_codercoder123';

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, age } = req.body;
    //valido los campos requeridos con userUtils
    try {
      UserUtils.validateUserData(req.body);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    //valido si el usuario ya existe en la base de datos
    const existingUser = await userModel.findOne({ email });
    if(existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'El email ya esta registrado'
      });
    }

    //Creo el carrito del usuario
    const newCart = new cartModel({
      products: []
    });
    await newCart.save();

    // creo al nuevo usuario
    const newUser = new userModel({
      first_name,
      last_name,
      email,
      password,
      age,
      cart: newCart._id
    });

    //guardo el usuario
    await newUser.save();

    //genero el token JWT
    const token = jwt.sign(
      {userId: newUser._id},
    JWT_SECRET,
    {expiresIn: '24h'}
  );

  const userDTO = UserDTO.fromUser(newUser);
  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado correctamente',
    token,
    user: userDTO
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
router.post('/login', (req, res, next) => {
  //autenticacion local
  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: info.message || 'Credenciales incorrectas'
      });
    }
    //genero el token JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    //Respuesta exitosa de login
    const userDTO = UserDTO.fromUser(user);
    res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      token,
      user: userDTO
    });
  })(req, res, next);
})

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

      const publicUserInfo = UserUtils.getPublicInfo(req.user);
      res.status(200).json({
        status: 'success',
        message: 'Usuario autenticado correctamente',
        user: publicUserInfo
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