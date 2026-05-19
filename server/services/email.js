const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 30000, // 30 segundos para conectar
    greetingTimeout: 30000,   // 30 segundos para o handshake
    socketTimeout: 60000      // 60 segundos para operações de socket
});

/**
 * Send an email using the shared transporter or Resend API
 */
async function sendEmail({ to, subject, html, replyTo }) {
    // Fallback a Nodemailer (SMTP) - Intentaremos por el puerto 587
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('As variáveis de ambiente EMAIL_USER e EMAIL_PASS não estão configuradas no servidor (Render).');
    }

    try {
        const info = await transporter.sendMail({
            from: `"SURDEASIA" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            replyTo
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email service error:', error);
        throw new Error('Falha no SMTP: ' + error.message);
    }
}

module.exports = { sendEmail };
