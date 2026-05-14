/**
 * SURDEASIA — Express Server
 * Serves the static frontend and provides API for Mercado Pago payments
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory (the frontend)
app.use(express.static(path.join(__dirname, '..')));

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'orders.db'));
db.pragma('journal_mode = WAL');

// Create orders table
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_cpf TEXT,
        customer_phone TEXT,
        address_cep TEXT,
        address_street TEXT,
        address_number TEXT,
        address_neighborhood TEXT,
        address_city TEXT,
        address_state TEXT,
        items TEXT NOT NULL,
        total_cents INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        payment_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Make db accessible to routes
app.locals.db = db;

// API Routes
app.use('/api/pay', require('./routes/payments'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/contact', require('./routes/contact'));

// Orders API (for admin use — simple view of all orders)
app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
});

// Serve pages
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'checkout.html'));
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
