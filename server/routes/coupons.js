const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// Validate a coupon
router.get('/validate/:code', async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ error: 'Supabase não configurado' });

        const code = req.params.code.trim().toUpperCase();
        
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !coupon) {
            return res.status(404).json({ valid: false, error: 'Cupom inválido ou não encontrado.' });
        }

        if (coupon.is_used) {
            return res.status(400).json({ valid: false, error: 'Este cupom já foi utilizado.' });
        }

        res.json({ valid: true, value_cents: coupon.value_cents });
    } catch (e) {
        console.error('Erro ao validar cupom:', e);
        res.status(500).json({ valid: false, error: 'Erro interno ao validar cupom.' });
    }
});

// Create a new coupon (Admin)
router.post('/', async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ error: 'Supabase não configurado' });

        const { code, value_cents } = req.body;
        
        if (!code || !value_cents || value_cents <= 0) {
            return res.status(400).json({ error: 'Código e valor são obrigatórios.' });
        }

        const couponCode = String(code).trim().toUpperCase().replace(/\s+/g, '-');

        // Check if exists
        const { data: existing } = await supabase
            .from('coupons')
            .select('code')
            .eq('code', couponCode)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ error: 'Um cupom com este código já existe.' });
        }

        const { error } = await supabase
            .from('coupons')
            .insert({
                code: couponCode,
                value_cents: parseInt(value_cents),
                is_used: false
            });

        if (error) throw error;

        res.json({ success: true, code: couponCode, value_cents: parseInt(value_cents) });
    } catch (e) {
        console.error('Erro ao criar cupom:', e);
        res.status(500).json({ error: 'Erro ao criar cupom. Verifique se a tabela coupons foi criada no banco.' });
    }
});

// List all active coupons (Admin)
router.get('/', async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ error: 'Supabase não configurado' });

        const { data: coupons, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('is_used', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(coupons);
    } catch (e) {
        console.error('Erro ao buscar cupons:', e);
        res.status(500).json({ error: 'Erro ao buscar cupons.' });
    }
});

module.exports = router;
