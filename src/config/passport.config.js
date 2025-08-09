//configuradion de passport para autenticar con jwt
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { userModel } from '../dao/models/userModel.js';

//Clave secreta para firmar el token
const JWT_SECRET = process.env.JWT_SECRET;

// configuracion de la estrategia de aut con jwt
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

// Estrategia JWT para autentucacion
passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    //busco el usuario por ID del payload
    const user = await userModel.findById(payload.userId);
    if(!user){
      return done(null, false);
    }
    return done(null, user);
  }catch (error) {
    return done(error, false);
  }
}));

// Estrategia "current" para validar si el usuario esta logeado 
passport.use('current', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await userModel.findById(payload.userId).select('-password');
    if(!user){
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// serialize and deserialize el usuario 
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id).select('-password');
    done(null, user);
    } catch (error) {
      done(error, null);
    }
});

export default {passport, jwt};