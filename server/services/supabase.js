const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());
    } catch (e) {
        console.error('⚠️ Erro ao inicializar Supabase. Verifique se a SUPABASE_URL começa com https://', e.message);
    }
}

module.exports = supabase;
