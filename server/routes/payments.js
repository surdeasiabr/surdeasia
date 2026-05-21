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
        const { customer, items, coupon_code } = req.body;

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
        let totalCents = items.reduce((sum, item) => {
            return sum + Math.round(item.price * 100) * item.quantity;
        }, 0);

        const supabase = require('../services/supabase');

        // Coupon Validation
        let appliedCoupon = null;
        if (coupon_code) {
            const { data: coupon, error: couponErr } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', coupon_code.trim().toUpperCase())
                .single();

            if (couponErr || !coupon) {
                return res.status(400).json({ success: false, message: 'Cupom inválido ou não encontrado.' });
            }
            if (coupon.is_used) {
                return res.status(400).json({ success: false, message: 'Este cupom já foi utilizado.' });
            }

            appliedCoupon = coupon;
            // Apply discount (don't go below 0)
            totalCents = Math.max(0, totalCents - coupon.value_cents);
            
            // Add as pseudo-item for tracking and admin display
            items.push({
                id: 'coupon',
                name: `Cupom (${coupon.code})`,
                price: -(coupon.value_cents / 100),
                quantity: 1,
                code: coupon.code,
                color: '-',
                size: '-'
            });
        }

        // Check stock for all items
        const stockUpdates = [];
        for (const item of items) {
            if (item.id === 'shipping') continue;
            
            const { data: stockData } = await supabase
                .from('stock')
                .select('stock')
                .eq('product_id', item.id)
                .eq('size', item.size)
                .eq('color', item.color)
                .single();
                
            if (stockData) {
                if (stockData.stock < item.quantity) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `O produto "${item.name}" não tem estoque suficiente no momento.` 
                    });
                }
                stockUpdates.push({
                    product_id: item.id,
                    size: item.size,
                    color: item.color,
                    new_stock: stockData.stock - item.quantity
                });
            }
        }

        // Reserve stock immediately
        for (const update of stockUpdates) {
            await supabase
                .from('stock')
                .update({ stock: update.new_stock })
                .eq('product_id', update.product_id)
                .eq('size', update.size)
                .eq('color', update.color);
        }

        // Mark coupon as used
        if (appliedCoupon) {
            await supabase
                .from('coupons')
                .update({ is_used: true })
                .eq('code', appliedCoupon.code);
        }

        // Save order in DB as pending
        const { error: dbError } = await require('../services/supabase')
            .from('orders')
            .insert({
                id: orderId,
                customer_name: customer.name,
                customer_email: customer.email || '',
                customer_cpf: customer.cpf || '',
                customer_phone: customer.phone || '',
                address_cep: customer.address?.cep || '',
                address_street: customer.address?.street || '',
                address_number: customer.address?.number || '',
                address_neighborhood: customer.address?.neighborhood || '',
                address_city: customer.address?.city || '',
                address_state: customer.address?.state || '',
                items: JSON.stringify(items),
                total_cents: totalCents,
                payment_method: 'mercadopago',
                status: 'pending'
            });

        if (dbError) {
            console.error('Error saving order to Supabase:', dbError);
            // Non-blocking for now, but should ideally fail checkout
        }

        // Create Mercado Pago preference
        const result = await mp.createPreference({
            orderId,
            items,
            customer,
            siteUrl
        });

        if (result.success) {
            // Update order with preference ID
            await require('../services/supabase')
                .from('orders')
                .update({ payment_id: result.preferenceId })
                .eq('id', orderId);

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
