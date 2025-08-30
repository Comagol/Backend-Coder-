import { Router } from 'express';
import { userModel } from '../dao/models/userModel.js';
import { recoveryTokenModel } from '../dao/models/recoveryTokenModel.js';
import { sendEmail } from '../config/email.config.js';
import { UserUtils } from '../utils/userUtils.js';

const router = Router();

// POST /api/recovery/request - Solicitar recuperación de contraseña
router.post('/request', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'El email es requerido'
            });
        }

        // Verificar si el usuario existe
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No existe una cuenta con ese email'
            });
        }

        // Eliminar tokens anteriores del usuario
        await recoveryTokenModel.deleteMany({ userId: user._id });

        // Crear nuevo token de recuperación
        const recoveryToken = new recoveryTokenModel({
            userId: user._id
        });

        await recoveryToken.save();

        // Generar enlace de recuperación
        const resetLink = `${process.env.BASE_URL || 'http://localhost:8080'}/reset-password?token=${recoveryToken.token}`;

        // Template del email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Recuperación de Contraseña</h2>
                <p>Hola ${user.first_name},</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p><strong>Este enlace expirará en 1 hora.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
            </div>
        `;

        // Enviar email
        const emailSent = await sendEmail(
            user.email,
            'Recuperación de Contraseña - Ecommerce Coder',
            emailHtml
        );

        if (!emailSent) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al enviar el email de recuperación'
            });
        }

        res.json({
            status: 'success',
            message: 'Se ha enviado un email con las instrucciones para restablecer tu contraseña'
        });

    } catch (error) {
        console.error('Error en solicitud de recuperación:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// POST /api/recovery/reset - Restablecer contraseña
router.post('/reset', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Token y nueva contraseña son requeridos'
            });
        }

        // Buscar el token de recuperación
        const recoveryToken = await recoveryTokenModel.findOne({ token });
        
        if (!recoveryToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Token de recuperación inválido'
            });
        }

        // Verificar si el token es válido
        if (!recoveryToken.isValid()) {
            return res.status(400).json({
                status: 'error',
                message: 'El token de recuperación ha expirado o ya fue usado'
            });
        }

        // Obtener el usuario
        const user = await userModel.findById(recoveryToken.userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que la nueva contraseña no sea igual a la actual
        const isSamePassword = user.comparePassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                status: 'error',
                message: 'La nueva contraseña no puede ser igual a la actual'
            });
        }

        // Validar la nueva contraseña
        try {
            UserUtils.validateUserData({ 
                first_name: user.first_name, 
                last_name: user.last_name, 
                email: user.email, 
                password: newPassword, 
                age: user.age 
            });
        } catch (validationError) {
            return res.status(400).json({
                status: 'error',
                message: validationError.message
            });
        }

        // Actualizar la contraseña
        user.password = newPassword;
        await user.save();

        // Marcar el token como usado
        recoveryToken.used = true;
        await recoveryToken.save();

        res.json({
            status: 'success',
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error restableciendo contraseña:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

export default router;