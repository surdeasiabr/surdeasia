const express = require('express');
const router = express.Router();
const MercadoPagoService = require('../services/mercadopago');
const { sendEmail } = require('../services/email');
const supabase = require('../services/supabase');

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

                // Update order status in Supabase
                if (supabase) {
                    await supabase
                        .from('orders')
                        .update({ status, payment_id: String(paymentId) })
                        .eq('id', orderId);
                }

                console.log(`📦 Pedido ${orderId}: ${status} (Payment ${paymentId})`);

                // Send email notification to owner if approved
                if (result.status === 'approved') {
                    if (supabase) {
                        const { data: order } = await supabase
                            .from('orders')
                            .select('*')
                            .eq('id', orderId)
                            .single();
                            
                        if (order) {
                            const items = JSON.parse(order.items);
                            // Se o pagamento falhar ou for cancelado, devolvemos o estoque
                            if (status === 'rejected' || status === 'cancelled') {
                                for (const item of items) {
                                    if (item.id === 'shipping') continue;
                                    try {
                                        const { data: stockData } = await supabase
                                            .from('stock')
                                            .select('stock')
                                            .eq('product_id', item.id)
                                            .eq('size', item.size)
                                            .eq('color', item.color)
                                            .single();
                                            
                                        if (stockData) {
                                            await supabase
                                                .from('stock')
                                                .update({ stock: stockData.stock + item.quantity })
                                                .eq('product_id', item.id)
                                                .eq('size', item.size)
                                                .eq('color', item.color);
                                            console.log(`📦 Estoque devolvido: +${item.quantity} de ${item.id}`);
                                        }
                                    } catch (e) {
                                        console.error(`Erro ao devolver estoque para ${item.id}:`, e);
                                    }
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

                            // ── Meta Conversions API: Purchase (server-side, verified) ──
                            // This fires only when Mercado Pago confirms the payment via webhook.
                            // Uses orderId as event_id to deduplicate with the browser Pixel event.
                            // Requires META_ACCESS_TOKEN env var in Render dashboard.
                            if (process.env.META_ACCESS_TOKEN) {
                                try {
                                    const crypto = require('crypto');
                                    const hashSHA256 = (val) => val
                                        ? crypto.createHash('sha256').update(String(val).trim().toLowerCase()).digest('hex')
                                        : undefined;

                                    const capiPayload = {
                                        data: [{
                                            event_name: 'Purchase',
                                            event_time: Math.floor(Date.now() / 1000),
                                            event_id: orderId,
                                            action_source: 'website',
                                            event_source_url: 'https://surdeasiabr.com/checkout-result',
                                            user_data: {
                                                em: hashSHA256(order.customer_email),
                                                ph: hashSHA256(order.customer_phone)
                                            },
                                            custom_data: {
                                                value: result.transaction_amount || (order.total_cents / 100),
                                                currency: 'BRL',
                                                content_type: 'product',
                                                order_id: orderId
                                            }
                                        }]
                                    };

                                    const capiRes = await fetch(
                                        `https://graph.facebook.com/v20.0/2128091181457539/events?access_token=${process.env.META_ACCESS_TOKEN}`,
                                        {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(capiPayload)
                                        }
                                    );
                                    const capiData = await capiRes.json();
                                    console.log(`📊 Meta CAPI Purchase sent for order ${orderId}:`, capiData.events_received || capiData.error);
                                } catch (capiErr) {
                                    // Silent fail — never block order confirmation
                                    console.error('Meta CAPI error (non-critical):', capiErr.message);
                                }
                            }

                        }
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
