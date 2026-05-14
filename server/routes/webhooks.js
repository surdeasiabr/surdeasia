/**
 * SURDEASIA — Webhook Routes (Mercado Pago notifications)
 * Receives payment status updates from Mercado Pago
 */
const express = require('express');
const router = express.Router();
const MercadoPagoService = require('../services/mercadopago');

const mp = new MercadoPagoService();

/**
 * Mercado Pago sends notifications here when payment status changes
 */
router.post('/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data?.id;
            if (!paymentId) return res.sendStatus(200);

            // Get payment details from MP
            const result = await mp.getPayment(paymentId);

            if (result.success) {
                const db = req.app.locals.db;
                const orderId = result.externalReference;

                let status = 'pending';
                if (result.status === 'approved') status = 'confirmed';
                else if (result.status === 'rejected') status = 'rejected';
                else if (result.status === 'cancelled') status = 'cancelled';
                else if (result.status === 'refunded') status = 'refunded';

                // Update order status
                db.prepare('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?')
                    .run(status, String(paymentId), orderId);

                console.log(`📦 Pedido ${orderId}: ${status} (Payment ${paymentId})`);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('Webhook error:', err);
        res.sendStatus(200); // Always return 200 to MP
    }
});

module.exports = router;
