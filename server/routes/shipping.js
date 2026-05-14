/**
 * SURDEASIA — Shipping Routes
 * GET /api/shipping/calculate?cep=XXXXX&items=N — Calculate shipping cost
 */
const express = require('express');
const router = express.Router();
const ShippingService = require('../services/shipping');

const shipping = new ShippingService();

router.get('/calculate', async (req, res) => {
    try {
        const { cep, items } = req.query;

        if (!cep) {
            return res.status(400).json({ error: 'CEP é obrigatório.' });
        }

        const itemCount = parseInt(items) || 1;
        const result = await shipping.calculate(cep, itemCount);

        res.json(result);
    } catch (err) {
        console.error('Shipping calc error:', err);
        res.status(500).json({ error: 'Erro ao calcular frete.' });
    }
});

module.exports = router;
