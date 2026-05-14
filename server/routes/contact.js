const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/email');

router.post('/', async (req, res) => {
    try {
        const { name, email, message, type } = req.body;

        // 1. Send the inquiry TO surdeasia (contato@surdeasiabr.com)
        const typeLabel = type === 'atacado' ? 'Atacado' : (type === 'araras' ? 'Projeto Araras' : 'Contato');
        
        await sendEmail({
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Nova Consulta do Site - ${typeLabel}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                    <h2 style="color: #1f3b4d; border-bottom: 2px solid #1f3b4d; padding-bottom: 10px;">Nova Mensagem Recebida</h2>
                    <p style="font-size: 16px;"><strong>Nome/Empresa:</strong> ${name}</p>
                    <p style="font-size: 16px;"><strong>E-mail:</strong> ${email}</p>
                    <p style="font-size: 16px;"><strong>Origem:</strong> ${typeLabel}</p>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-top: 20px;">
                        <p style="margin: 0; font-weight: bold; color: #666;">Mensagem:</p>
                        <p style="font-style: italic;">${message ? message.replace(/\n/g, '<br>') : 'Sem mensagem adicional.'}</p>
                    </div>
                    <p style="margin-top: 30px; font-size: 12px; color: #999;">Recebido via formulário do site SURDEASIA.</p>
                </div>
            `
        });

        // 2. Automated response TO the client
        if (type === 'atacado') {
            await sendEmail({
                to: email,
                subject: `Proposta Atacado - SURDEASIA`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #1f3b4d; font-size: 24px; letter-spacing: 2px;">SURDEASIA</h1>
                        </div>
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
            });
        } else if (type === 'araras') {
            await sendEmail({
                to: email,
                subject: `Bem-vindo ao Projeto Araras — SURDEASIA`,
                html: `
                    <div style="font-family: 'Cormorant Garamond', Georgia, serif; color: #1f3b4d; line-height: 1.8; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #eee;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <h1 style="font-size: 28px; letter-spacing: 4px; font-weight: 300; margin-bottom: 10px;">SURDEASIA</h1>
                            <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a5f;">Projeto Araras</p>
                        </div>
                        <h2 style="font-weight: 400; font-size: 22px;">Olá ${name},</h2>
                        <p>Recebemos o seu interesse em integrar o **Projeto Araras** ao seu espaço premium.</p>
                        <p>A SURDEASIA não vende apenas roupas; nós criamos experiências. Nossa estrutura de madeira minimalista e nossa curadoria de peças são desenhadas para encantar hóspedes e clientes que valorizam o lifestyle mediterrâneo.</p>
                        <div style="background: #fbfbfb; padding: 25px; border-radius: 4px; margin: 30px 0;">
                            <p style="margin: 0; font-style: italic;">"Estamos analisando seu perfil e em breve entraremos em contato para uma conversa personalizada sobre como podemos transformar seu ambiente."</p>
                        </div>
                        <p>Enquanto isso, convidamos você a explorar mais sobre nossa visão em nossas redes sociais ou respondendo diretamente a este e-mail.</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="https://wa.me/5521972100797" style="background-color: #1f3b4d; color: #fff; padding: 18px 35px; text-decoration: none; border-radius: 0; font-family: sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Falar com Consultor</a>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 50px;">Atenciosamente,<br><strong style="color: #1f3b4d;">Tomás Pagliere</strong><br>Fundador, SURDEASIA</p>
                    </div>
                `
            });
        }

        res.json({ success: true, message: 'Mensagem enviada com sucesso!' });

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ success: false, error: 'Erro ao enviar e-mail.' });
    }
});

module.exports = router;
