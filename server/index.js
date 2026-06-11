/**
 * SURDEASIA — Express Server
 * Serves the static frontend and provides API for Mercado Pago payments
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./services/supabase');
const { syncDatabase } = require('./services/syncDb');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Disable cache for JS/CSS so updates always take effect immediately
app.use((req, res, next) => {
    if (/\.(js|css)(\?.*)?$/.test(req.url)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

// Serve static files from parent directory (the frontend)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/pay', require('./routes/payments'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/estoque', require('./routes/estoque'));
app.use('/api/coupons', require('./routes/coupons'));

// Wholesale Leads API
app.post('/api/wholesale-leads', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase not configured');
        const lead = req.body;
        const { data, error } = await supabase.from('wholesale_leads').insert([lead]);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/wholesale-leads', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.from('wholesale_leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/debug', (req, res) => {
    res.json({
        url_exists: !!process.env.SUPABASE_URL,
        key_exists: !!process.env.SUPABASE_KEY,
        url_val: process.env.SUPABASE_URL,
        supabase_is_null: !supabase || !!supabase._error,
        error: supabase ? supabase._error : null
    });
});

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

// Manual cancel order endpoint
app.post('/api/orders/:id/cancel', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase not configured');
        const orderId = req.params.id;
        
        // Fetch order
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
        if (fetchError || !order) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        
        if (order.status === 'cancelled') {
            return res.status(400).json({ error: 'Pedido já está cancelado.' });
        }
        
        // Mark cancelled
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
            
        if (updateError) throw updateError;
        
        // Restore stock
        let items = [];
        try {
            items = JSON.parse(order.items);
        } catch (e) {}
        
        for (const item of items) {
            if (item.id === 'shipping') continue;
            
            if (item.id === 'coupon' && item.code) {
                // Restore coupon
                await supabase
                    .from('coupons')
                    .update({ is_used: false })
                    .eq('code', item.code);
                continue;
            }

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
            }
        }
        
        res.json({ success: true, message: 'Pedido cancelado e estoque restaurado.' });
    } catch (e) {
        console.error('Cancel order error:', e);
        res.status(500).json({ error: 'Erro ao cancelar o pedido.' });
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

// Clean up abandoned pending orders and restore their stock (every 15 minutes)
setInterval(async () => {
    try {
        if (!supabase) return;
        const timeLimit = new Date(Date.now() - 45 * 60 * 1000).toISOString();
        const { data: abandoned } = await supabase
            .from('orders')
            .select('id, items')
            .eq('status', 'pending')
            .lt('created_at', timeLimit);

        if (abandoned && abandoned.length > 0) {
            for (const order of abandoned) {
                await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                try {
                    const items = JSON.parse(order.items);
                    for (const item of items) {
                        if (item.id === 'shipping') continue;
                        
                        if (item.id === 'coupon' && item.code) {
                            await supabase
                                .from('coupons')
                                .update({ is_used: false })
                                .eq('code', item.code);
                            console.log(`🎫 Cupom devolvido por abandono: ${item.code}`);
                            continue;
                        }

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
                            console.log(`📦 Estoque devolvido por abandono: +${item.quantity} de ${item.id}`);
                        }
                    }
                } catch (err) {
                    console.error('Erro ao restaurar estoque do pedido:', order.id, err);
                }
            }
            console.log(`🧹 Limpeza: ${abandoned.length} pedidos abandonados foram cancelados.`);
        }
    } catch (e) {
        console.error('Erro na limpeza de pedidos abandonados:', e);
    }
}, 15 * 60 * 1000);

app.listen(PORT, async () => {
    const hasToken = process.env.MERCADOPAGO_ACCESS_TOKEN && 
                     process.env.MERCADOPAGO_ACCESS_TOKEN !== 'SEU_ACCESS_TOKEN_AQUI';
    
    console.log(`\n  🌊 SURDEASIA Server running at http://localhost:${PORT}`);
    console.log(`  📦 API available at http://localhost:${PORT}/api`);
    console.log(`  💳 Mercado Pago: ${hasToken ? '✅ Configurado' : '⚠️  Falta o Access Token no .env'}`);
    console.log(`  📋 Ver pedidos: http://localhost:${PORT}/api/orders\n`);

    // Run database sync on startup
    try {
        await syncDatabase();
    } catch (e) {
        console.error('Failed to run syncDatabase on startup:', e);
    }
});
