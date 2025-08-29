import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from '../dao/models/userModel.js';
import { cartModel } from '../dao/models/cartModel.js';
import { UserRepository } from '../repositories/index.js';
import { UserUtils } from '../utils/userUtils.js';

//inicializo el router
const router = express.Router();
const userRepository = new UserRepository();

const JWT_SECRET = process.env.JWT_SECRET || 'contraseña_secreta_codercoder123';

// POST /api/sessions/register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
      const { first_name, last_name, email, password, age } = req.body;

      // Crear el carrito del usuario
      const newCart = new cartModel({
          products: []
      });
      await newCart.save();

      // Crear al nuevo usuario
      const newUser = new userModel({
          first_name,
          last_name,
          email,
          password,
          age,
          cart: newCart._id
      });

      // Guardar el usuario
      await newUser.save();

      // Generar el token JWT
      const token = jwt.sign(
          { userId: newUser._id },
          JWT_SECRET,
          { expiresIn: '24h' }
      );

      // Usar UserRepository para obtener DTO
      const userDTO = await userRepository.findUserById(newUser._id);

      res.status(201).json({
          status: 'success',
          message: 'Usuario registrado correctamente',
          token,
          user: userDTO
      });

  } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
          status: 'error',
          message: 'Error interno del servidor al registrar el usuario'
      });
  }
});

// POST /api/sessions/login - Login de usuario
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) {
          console.error('Error en login:', err);
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

      // Generar el token JWT
      const token = jwt.sign(
          { userId: user._id },
          JWT_SECRET,
          { expiresIn: '24h' }
      );

      // Usar UserRepository para obtener DTO
      const userDTO = await userRepository.findUserById(user._id);

      res.status(200).json({
          status: 'success',
          message: 'Login exitoso',
          token,
          user: userDTO
      });
  })(req, res, next);
});

// GET /api/sessions/current - Obtener usuario actual
router.get('/current', 
  passport.authenticate('current', { session: false }), 
  async (req, res) => {
      try {
          if (!req.user) {
              return res.status(401).json({
                  status: 'error',
                  message: 'No autorizado'
              });
          }

          // Usar UserRepository para obtener información pública
          const publicUserInfo = await userRepository.getPublicUserInfo(req.user._id);

          res.status(200).json({
              status: 'success',
              message: 'Usuario autenticado correctamente',
              user: publicUserInfo
          });
      } catch (error) {
          console.error('Error en /current:', error);
          res.status(500).json({
              status: 'error',
              message: 'Error al obtener el usuario autenticado'
          });
      }
  }
);

export default router;