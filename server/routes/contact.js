const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    try {
        const { name, email, message, type } = req.body;

        // Verify if email configuration exists
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('E-mail não configurado. Tentativa de envio simulada.');
            return res.status(200).json({ success: true, message: 'Simulado (configure EMAIL_USER e EMAIL_PASS)' });
        }

        // Configure the transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.hostinger.com', // Ajuste para o seu provedor (hostinger, gmail, etc)
            port: process.env.EMAIL_PORT || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // contato@surdeasiabr.com
                pass: process.env.EMAIL_PASS
            }
        });

        // 1. Send the inquiry TO surdeasia (contato@surdeasiabr.com)
        const mailToSurdeasia = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Nova Consulta do Site - ${type === 'atacado' ? 'Atacado' : (type === 'araras' ? 'Projeto Araras' : 'Contato')}`,
            html: `
                <h2>Nova Mensagem recebida pelo site</h2>
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Tipo:</strong> ${type}</p>
                <p><strong>Mensagem:</strong><br>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await transporter.sendMail(mailToSurdeasia);

        // 2. If it's wholesale (atacado), send the automatic proposal TO the client
        if (type === 'atacado') {
            const mailToClient = {
                from: `"SURDEASIA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Proposta Atacado - SURDEASIA`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1f3b4d;">Olá ${name},</h2>
                        <p>Agradecemos o seu interesse na SURDEASIA.</p>
                        <p>Preparamos uma apresentação especial para você conhecer nossa essência, nosso modelo de negócio e nossa proposta comercial de atacado.</p>
                        <p>Você pode acessar nossa apresentação completa através do link abaixo:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${req.protocol}://${req.get('host')}/proposta-atacado.html" style="background-color: #1f3b4d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Ver Proposta SURDEASIA</a>
                        </div>
                        <p>Caso tenha qualquer dúvida, estamos à disposição por aqui ou através do nosso WhatsApp: +55 21 97210-0797.</p>
                        <p>Atenciosamente,<br><strong>Tomás Pagliere</strong><br>SURDEASIA</p>
                    </div>
                `
            };
            await transporter.sendMail(mailToClient);
        }

        res.json({ success: true, message: 'Mensagem enviada com sucesso!' });

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ success: false, error: 'Erro ao enviar e-mail.' });
    }
});

module.exports = router;
