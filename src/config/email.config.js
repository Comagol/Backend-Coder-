import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'felton39@ethereal.email',
        pass: 'ws3gyr88MZtyS5tcf1'
    }
});

const enviarMail = (to, subject, message) => {
    return transporter.sendMail({
        from: "Ecommerce Coder <felton39@ethereal.email>",
        to: to,
        subject: subject,
        html: message
    });
}

// Función para usar en nuestro sistema
export const sendEmail = async (to, subject, html) => {
    try {
        const result = await enviarMail(to, subject, html);
        
        if (result.rejected && result.rejected.length > 0) {
            return false;
        }

        return true;
        
    } catch (error) {
        return false;
    }
}

export default transporter;