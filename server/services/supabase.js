const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
let supabaseError = null;

if (supabaseUrl && supabaseKey) {
    try {
        const cleanUrl = supabaseUrl.replace(/[^a-zA-Z0-9\.\-:\/]/g, '');
        const cleanKey = supabaseKey.replace(/[^a-zA-Z0-9\_\-]/g, '');
        // Require ws explicitly in case Node 20 is used
        const ws = require('ws');
        supabase = createClient(cleanUrl, cleanKey, {
            auth: {
                persistSession: false
            }
        });
        // Override transport globally if needed or let Supabase 22.x handle it
    } catch (e) {
        supabaseError = e.message;
        console.error('⚠️ Erro ao inicializar Supabase. Verifique se a SUPABASE_URL começa com https://', e.message);
    }
}

// Se deu erro, exporta um objeto fake com a propriedade _error para debugar, senao exporta null ou o client
module.exports = supabase || (supabaseError ? { _error: supabaseError } : null);
