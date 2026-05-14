const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email using the shared transporter
 */
async function sendEmail({ to, subject, html, replyTo }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('E-mail não configurado. Envio ignorado.');
        return { success: true, simulated: true };
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
        throw error;
    }
}

module.exports = { sendEmail };
