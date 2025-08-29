import nodemailer from 'nodemailer';

//CONFIGO EL TRANSPORTADOR DE EMAIL
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//funcion para envial email
export const sendEmail = async (to, subject, html) => {
  try {
      const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: to,
          subject: subject,
          html: html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error enviando email:', error);
      return false;
  }
};

export default transporter;