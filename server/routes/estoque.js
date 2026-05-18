const express = require('express');
const router = express.Router();

// Helper to parse simple CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return [];
    
    // Assumes columns: ID, Nome, Tamanho, Cor, Estoque
    // Example: 10, Chemisse Wave, Tamanho Único, Branco, 5
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const separator = lines[i].includes(';') ? ';' : ',';
        const parts = lines[i].split(separator).map(p => p.trim());
        if (parts.length >= 4) {
            let stockVal = parseInt(parts[4]);
            if (isNaN(stockVal)) stockVal = 0;
            
            data.push({
                id: parseInt(parts[0]),
                size: parts[2],
                color: parts[3],
                stock: stockVal
            });
        }
    }
    return data;
}

router.get('/', async (req, res) => {
    try {
        const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;
        
        // Se não houver URL configurada, retornar que o sistema de estoque está desativado
        if (!sheetUrl) {
            return res.json({ useStock: false, data: [] });
        }

        // Fetch CSV from Google Sheets
        const fetch = (await import('node-fetch')).default || global.fetch; // Supports node 18+ global fetch
        const response = await fetch(sheetUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from Google Sheets: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const stockData = parseCSV(csvText);
        
        res.json({ useStock: true, data: stockData });
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ useStock: false, error: 'Erro ao processar a planilha de estoque' });
    }
});

module.exports = router;
