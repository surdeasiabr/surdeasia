const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { syncDatabase } = require('../services/syncDb');

router.get('/', async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ useStock: false, error: 'Supabase não configurado' });

        const { data: stockData, error } = await supabase
            .from('stock')
            .select('product_id, name, size, color, stock')
            .order('product_id', { ascending: true })
            .order('color', { ascending: true });

        if (error) throw error;
        
        // Rename product_id to id for the frontend
        const formattedData = stockData.map(s => ({
            id: s.product_id,
            name: s.name,
            size: s.size,
            color: s.color,
            stock: s.stock
        }));

        res.json({ useStock: true, data: formattedData });
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ useStock: false, error: 'Erro ao buscar estoque do banco' });
    }
});

// Update stock
router.post('/update', async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ success: false, error: 'Supabase não configurado' });
        
        const { product_id, size, color, new_stock } = req.body;
        
        const { error } = await supabase
            .from('stock')
            .update({ stock: new_stock })
            .eq('product_id', product_id)
            .eq('size', size)
            .eq('color', color);
            
        if (error) throw error;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sync stock with products.js manually
router.post('/sync', async (req, res) => {
    try {
        const result = await syncDatabase();
        if (result.success) {
            res.json({ success: true, message: 'Banco de dados sincronizado com sucesso!' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Erro ao sincronizar estoque:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
