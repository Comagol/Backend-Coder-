//utilidades para manejar usuarios
export class UserUtils {
  // Obtener solo información pública del usuario
  static getPublicInfo(user) {
      return {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
      };
  }

  // Validar datos de usuario
  static validateUserData(userData) {
      const required = ['first_name', 'last_name', 'email', 'password', 'age'];
      const missing = required.filter(field => !userData[field]);
      
      if (missing.length > 0) {
          throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
      }

      if (userData.age < 0) {
          throw new Error('La edad no puede ser negativa');
      }

      if (userData.password.length < 8) {
          throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      if (!userData.email.includes('@')) {
          throw new Error('El email debe contener un @');
      }

      return true;
  }
}