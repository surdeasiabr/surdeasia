const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = req.app.locals.db;
        const stockData = db.prepare('SELECT product_id as id, name, size, color, stock FROM stock').all();
        res.json({ useStock: true, data: stockData });
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ useStock: false, error: 'Erro ao buscar estoque do banco' });
    }
});

// Update stock
router.post('/update', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { product_id, size, color, new_stock } = req.body;
        
        const update = db.prepare('UPDATE stock SET stock = ? WHERE product_id = ? AND size = ? AND color = ?');
        update.run(new_stock, product_id, size, color);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
