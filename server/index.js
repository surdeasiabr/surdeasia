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

// Create stock table
db.exec(`
    CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        name TEXT,
        size TEXT,
        color TEXT,
        stock INTEGER DEFAULT 0,
        UNIQUE(product_id, size, color)
    )
`);

// Seed stock table from CSV if it's empty
const stockCount = db.prepare('SELECT COUNT(*) as count FROM stock').get();
if (stockCount.count === 0) {
    const fs = require('fs');
    const csvPath = path.join(__dirname, '..', 'estoque_inicial.csv');
    if (fs.existsSync(csvPath)) {
        console.log('📦 Populando banco de dados com estoque inicial...');
        const lines = fs.readFileSync(csvPath, 'utf-8').split('\n');
        const insertStock = db.prepare('INSERT INTO stock (product_id, name, size, color, stock) VALUES (?, ?, ?, ?, ?)');
        
        const insertMany = db.transaction((items) => {
            for (const item of items) {
                try {
                    insertStock.run(item.product_id, item.name, item.size, item.color, item.stock);
                } catch (e) {
                    // ignore unique constraint
                }
            }
        });
        
        const itemsToInsert = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length >= 5) {
                itemsToInsert.push({
                    product_id: parseInt(parts[0]),
                    name: parts[1].trim(),
                    size: parts[2].trim(),
                    color: parts[3].trim(),
                    stock: parseInt(parts[4]) || 0
                });
            }
        }
        insertMany(itemsToInsert);
        console.log('✅ Banco de dados de estoque populado com sucesso!');
    }
}

// Make db accessible to routes
app.locals.db = db;

// API Routes
app.use('/api/pay', require('./routes/payments'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/estoque', require('./routes/estoque'));

// Orders API (for admin use — simple view of all orders)
app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
});

// Serve pages
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'checkout.html'));
});

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
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
