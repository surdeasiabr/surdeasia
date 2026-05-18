const express = require('express');
const router = express.Router();
const MercadoPagoService = require('../services/mercadopago');
const { sendEmail } = require('../services/email');

const mp = new MercadoPagoService();

router.post('/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data?.id;
            if (!paymentId) return res.sendStatus(200);

            const result = await mp.getPayment(paymentId);

            if (result.success) {
                const db = req.app.locals.db;
                const orderId = result.externalReference;

                let status = 'pending';
                if (result.status === 'approved') status = 'confirmed';
                else if (result.status === 'rejected') status = 'rejected';
                else if (result.status === 'cancelled') status = 'cancelled';

                // Update order status
                db.prepare('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?')
                    .run(status, String(paymentId), orderId);

                console.log(`📦 Pedido ${orderId}: ${status} (Payment ${paymentId})`);

                // Send email notification to owner if approved
                if (result.status === 'approved') {
                    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
                    if (order) {
                        const items = JSON.parse(order.items);
                        
                        // Decrementar o estoque para cada item
                        const decrementStock = db.prepare('UPDATE stock SET stock = stock - ? WHERE product_id = ? AND size = ? AND color = ?');
                        for (const item of items) {
                            try {
                                decrementStock.run(item.quantity, item.id, item.size, item.color);
                                console.log(`📦 Estoque atualizado: -${item.quantity} de Produto ${item.id} (${item.color} - ${item.size})`);
                            } catch (e) {
                                console.error(`Erro ao diminuir estoque para ${item.id}:`, e);
                            }
                        }

                        const itemsHtml = items.map(item => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.color} - ${item.size})</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.price.toFixed(2)}</td>
                            </tr>
                        `).join('');

                        await sendEmail({
                            to: process.env.EMAIL_USER,
                            subject: `NOVA VENDA CONFIRMADA - Pedido #${orderId}`,
                            html: `
                                <div style="font-family: sans-serif; color: #333; max-width: 650px; border: 1px solid #ddd; padding: 20px;">
                                    <h2 style="background: #1f3b4d; color: #fff; padding: 15px; margin: -20px -20px 20px -20px;">🎉 Nova Venda Confirmada!</h2>
                                    
                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                        <tr><td colspan="2" style="background: #f4f4f4; padding: 10px;"><strong>Dados do Cliente</strong></td></tr>
                                        <tr><td style="padding: 5px;"><strong>Nome:</strong></td><td>${order.customer_name}</td></tr>
                                        <tr><td style="padding: 5px;"><strong>E-mail:</strong></td><td>${order.customer_email}</td></tr>
                                        <tr><td style="padding: 5px;"><strong>CPF:</strong></td><td>${order.customer_cpf}</td></tr>
                                        <tr><td style="padding: 5px;"><strong>Telefone:</strong></td><td>${order.customer_phone}</td></tr>
                                    </table>

                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                        <tr><td colspan="2" style="background: #f4f4f4; padding: 10px;"><strong>Endereço de Entrega</strong></td></tr>
                                        <tr><td style="padding: 5px;"><strong>CEP:</strong></td><td>${order.address_cep}</td></tr>
                                        <tr><td style="padding: 5px;"><strong>Endereço:</strong></td><td>${order.address_street}, ${order.address_number}</td></tr>
                                        <tr><td style="padding: 5px;"><strong>Bairro:</strong></td><td>${order.address_neighborhood}</td></tr>
                                        <tr><td style="padding: 5px;"><strong>Cidade:</strong></td><td>${order.address_city} - ${order.address_state}</td></tr>
                                    </table>

                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background: #f4f4f4;">
                                                <th style="padding: 10px; text-align: left;">Produto</th>
                                                <th style="padding: 10px;">Qtd</th>
                                                <th style="padding: 10px; text-align: right;">Preço</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHtml}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="2" style="padding: 10px; text-align: right;"><strong>TOTAL:</strong></td>
                                                <td style="padding: 10px; text-align: right;"><strong>R$ ${(order.total_cents / 100).toFixed(2)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    
                                    <p style="margin-top: 20px;"><strong>Método de Pagamento:</strong> ${order.payment_method}</p>
                                    <p><strong>ID do Pagamento (MP):</strong> ${paymentId}</p>
                                </div>
                            `
                        });
                    }
                }
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('Webhook error:', err);
        res.sendStatus(200);
    }
});

module.exports = router;
