import passport from "passport";

//middleware para verificar si el usuario esta autenticado
export const authenticateUser = (req, res, next) => {
  passport.authenticate('current', { session: false}, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error en autenticacion'
      });
    }
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};