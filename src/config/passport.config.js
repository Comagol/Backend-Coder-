//configuracion de passport para autenticar con jwt
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { userModel } from '../dao/models/userModel.js';

//Clave secreta para firmar el token
const JWT_SECRET = process.env.JWT_SECRET || 'contraseña_secreta_codercoder123';

// configuracion de la estrategia de aut con jwt
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

// configuro la estrategia de autenticacion local
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return done(null, false, { message:'Credenciales invalidas'});
    }
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return done(null, false, { message:'Credenciales invalidas'});
    }
    return done(null, user);
  }catch (error) {
    return done(error);
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


export default passport;