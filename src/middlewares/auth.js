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

//middleware para verificar roles especificos
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permisos para realizar esta accion'
      });
    }

    next();
  };
};