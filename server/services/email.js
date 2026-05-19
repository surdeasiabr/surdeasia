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
    // Si el usuario configuró RESEND_API_KEY, usamos la API HTTP (imposible que sea bloqueada por Render)
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'SURDEASIA <onboarding@resend.dev>', // Email de prueba de Resend. El usuario deberá verificar su dominio luego.
                    to: [to],
                    subject: subject,
                    html: html,
                    reply_to: replyTo
                })
            });
            const data = await res.json();
            if (res.ok) return { success: true, messageId: data.id };
            throw new Error(data.message || 'Error en Resend API');
        } catch (error) {
            console.error('Resend service error:', error);
            throw new Error('Falha na API de E-mail (Resend): ' + error.message);
        }
    }

    // Fallback a Nodemailer (SMTP) - Suele ser bloqueado por Render (Connection timeout)
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
