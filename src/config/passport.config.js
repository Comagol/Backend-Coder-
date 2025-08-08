//configuradion de passport para autenticar con jwt
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { userModel } from '../dao/models/userModel';

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
  } catch (error) {
    return done(error, false);
  }
}));

