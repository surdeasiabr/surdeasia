const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587, // FORCE port 587 to bypass Render port 465 blocks
    secure: false, // FORCE false for STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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
