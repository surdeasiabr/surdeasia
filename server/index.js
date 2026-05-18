/**
 * SURDEASIA — Express Server
 * Serves the static frontend and provides API for Mercado Pago payments
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./services/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory (the frontend)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/pay', require('./routes/payments'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/estoque', require('./routes/estoque'));

// Orders API (for admin use — simple view of all orders)
app.get('/api/orders', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Serve pages
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'checkout.html'));
});

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Orders panel route
app.get('/pedidos', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pedidos.html'));
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    const hasToken = process.env.MERCADOPAGO_ACCESS_TOKEN && 
                     process.env.MERCADOPAGO_ACCESS_TOKEN !== 'SEU_ACCESS_TOKEN_AQUI';
    
    console.log(`\n  🌊 SURDEASIA Server running at http://localhost:${PORT}`);
    console.log(`  📦 API available at http://localhost:${PORT}/api`);
    console.log(`  💳 Mercado Pago: ${hasToken ? '✅ Configurado' : '⚠️  Falta o Access Token no .env'}`);
    console.log(`  📋 Ver pedidos: http://localhost:${PORT}/api/orders\n`);
});
