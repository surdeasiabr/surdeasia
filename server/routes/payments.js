/**
 * SURDEASIA — Payment Routes (Mercado Pago)
 * POST /api/pay/checkout  — Create checkout and get redirect URL
 * POST /api/webhooks/mercadopago — Receive payment notifications
 */
const express = require('express');
const router = express.Router();
const MercadoPagoService = require('../services/mercadopago');
const { v4: uuidv4 } = require('uuid');

const mp = new MercadoPagoService();

/**
 * Create Checkout — Returns Mercado Pago URL for customer to pay
 */
router.post('/checkout', async (req, res) => {
    try {
        const { customer, items } = req.body;

        // Validate
        if (!customer?.name) {
            return res.status(400).json({ error: 'Nome é obrigatório.' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Carrinho vazio.' });
        }

        const orderId = uuidv4().slice(0, 8).toUpperCase();
        const siteUrl = process.env.SITE_URL || `http://localhost:${process.env.PORT || 3001}`;

        // Calculate total
        const totalCents = items.reduce((sum, item) => {
            return sum + Math.round(item.price * 100) * item.quantity;
        }, 0);

        // Save order in DB as pending
        const db = req.app.locals.db;
        db.prepare(`
            INSERT INTO orders (id, customer_name, customer_email, customer_cpf, customer_phone,
                address_cep, address_street, address_number, address_neighborhood, address_city, address_state,
                items, total_cents, payment_method, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            orderId,
            customer.name, customer.email || '', customer.cpf || '', customer.phone || '',
            customer.address?.cep || '', customer.address?.street || '',
            customer.address?.number || '', customer.address?.neighborhood || '',
            customer.address?.city || '', customer.address?.state || '',
            JSON.stringify(items), totalCents,
            'mercadopago', 'pending'
        );

        // Create Mercado Pago preference
        const result = await mp.createPreference({
            orderId,
            items,
            customer,
            siteUrl
        });

        if (result.success) {
            // Update order with preference ID
            db.prepare('UPDATE orders SET payment_id = ? WHERE id = ?')
                .run(result.preferenceId, orderId);

            res.json({
                success: true,
                orderId,
                checkoutUrl: result.checkoutUrl,
                sandboxUrl: result.sandboxUrl
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Erro ao criar pagamento.',
                error: result.error
            });
        }
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

module.exports = router;
