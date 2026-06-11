const fs = require('fs');
const vm = require('vm');
const path = require('path');
const supabase = require('./supabase');

function getProducts() {
    try {
        const productsJsPath = path.join(__dirname, '..', '..', 'products.js');
        const code = fs.readFileSync(productsJsPath, 'utf8');
        const context = {};
        vm.createContext(context);
        const result = vm.runInContext(code + '\n; products;', context);
        return result;
    } catch (e) {
        console.error('Error reading products.js in syncDb:', e);
        return [];
    }
}

async function syncDatabase() {
    if (!supabase || supabase._error) {
        console.error('Supabase not configured or has error. Skipping database sync.');
        return { success: false, error: 'Supabase not configured' };
    }

    console.log('🔄 Starting database synchronization with products.js...');
    const products = getProducts();
    if (!products || products.length === 0) {
        console.error('No products found in products.js. Sync aborted.');
        return { success: false, error: 'No products found' };
    }

    try {
        // 1. Fetch all current stock from database
        const { data: dbStock, error: dbError } = await supabase
            .from('stock')
            .select('*');

        if (dbError) throw dbError;

        // Group database stock by product_id
        const dbStockByProduct = {};
        (dbStock || []).forEach(row => {
            if (!dbStockByProduct[row.product_id]) {
                dbStockByProduct[row.product_id] = [];
            }
            dbStockByProduct[row.product_id].push(row);
        });

        // Track renames to update orders
        const renamedColors = {};
        const renamedSizes = {};
        const renamedProductNames = {};

        // 2. Loop through products in products.js
        for (const product of products) {
            const product_id = product.id;
            const expectedCombos = [];

            // Get all expected size/color combinations for this product
            const colorsList = product.colors || [];
            const sizesList = product.sizes || [];

            colorsList.forEach(c => {
                sizesList.forEach(s => {
                    expectedCombos.push({
                        product_id,
                        name: product.name,
                        size: s,
                        color: c.name
                    });
                });
            });

            const currentDbRows = dbStockByProduct[product_id] || [];

            // Match current DB rows and expected combinations
            const unmatchedDbRows = [...currentDbRows];
            const unmatchedExpected = [...expectedCombos];

            // Step A: Find exact matches on (size, color)
            for (let i = unmatchedExpected.length - 1; i >= 0; i--) {
                const expected = unmatchedExpected[i];
                const dbIndex = unmatchedDbRows.findIndex(
                    row => row.size === expected.size && row.color === expected.color
                );

                if (dbIndex !== -1) {
                    const dbRow = unmatchedDbRows[dbIndex];
                    // Name check: if name changed, update database row
                    if (dbRow.name !== expected.name) {
                        console.log(`✏️ Updating name in DB: Product ${product_id} "${dbRow.name}" -> "${expected.name}"`);
                        const { error } = await supabase
                            .from('stock')
                            .update({ name: expected.name })
                            .eq('product_id', product_id)
                            .eq('size', expected.size)
                            .eq('color', expected.color);
                        if (error) console.error('Error updating name:', error);
                    }
                    // Remove from unmatched
                    unmatchedExpected.splice(i, 1);
                    unmatchedDbRows.splice(dbIndex, 1);
                }
            }

            // Step B: Match remaining (orphaned) DB rows with new combinations (renames)
            const matchCount = Math.min(unmatchedDbRows.length, unmatchedExpected.length);
            for (let i = 0; i < matchCount; i++) {
                const oldRow = unmatchedDbRows[0];
                const newCombo = unmatchedExpected[0];

                console.log(`🔄 Renaming row in DB: Product ${product_id} (${oldRow.size}, ${oldRow.color}) -> (${newCombo.size}, ${newCombo.color})`);
                
                // Update in Supabase
                const { error } = await supabase
                    .from('stock')
                    .update({
                        size: newCombo.size,
                        color: newCombo.color,
                        name: newCombo.name
                    })
                    .eq('product_id', product_id)
                    .eq('size', oldRow.size)
                    .eq('color', oldRow.color);

                if (error) {
                    console.error('Error renaming row:', error);
                } else {
                    // Record renames
                    if (!renamedColors[product_id]) renamedColors[product_id] = {};
                    if (oldRow.color !== newCombo.color) {
                        renamedColors[product_id][oldRow.color] = newCombo.color;
                    }

                    if (!renamedSizes[product_id]) renamedSizes[product_id] = {};
                    if (oldRow.size !== newCombo.size) {
                        renamedSizes[product_id][oldRow.size] = newCombo.size;
                    }
                }

                // Remove from lists
                unmatchedDbRows.shift();
                unmatchedExpected.shift();
            }

            // Step C: Insert remaining expected combos (brand new colors/sizes)
            for (const newCombo of unmatchedExpected) {
                console.log(`➕ Inserting new combo in DB: Product ${product_id} (${newCombo.size}, ${newCombo.color})`);
                const { error } = await supabase
                    .from('stock')
                    .insert({
                        product_id,
                        name: newCombo.name,
                        size: newCombo.size,
                        color: newCombo.color,
                        stock: 10 // default initial stock
                    });
                if (error) console.error('Error inserting new combo:', error);
            }

            // Step D: Delete remaining orphaned rows (colors/sizes removed)
            for (const oldRow of unmatchedDbRows) {
                console.log(`🗑️ Deleting removed combo from DB: Product ${product_id} (${oldRow.size}, ${oldRow.color})`);
                const { error } = await supabase
                    .from('stock')
                    .delete()
                    .eq('product_id', product_id)
                    .eq('size', oldRow.size)
                    .eq('color', oldRow.color);
                if (error) console.error('Error deleting combo:', error);
            }

            // Record overall name change for orders (in case there was no color rename)
            const oldDbName = currentDbRows.length > 0 ? currentDbRows[0].name : null;
            if (oldDbName && oldDbName !== product.name) {
                renamedProductNames[product_id] = product.name;
            }
        }

        // 3. Update orders to match renames
        const hasRenames = Object.keys(renamedColors).length > 0 || 
                           Object.keys(renamedSizes).length > 0 || 
                           Object.keys(renamedProductNames).length > 0;

        if (hasRenames) {
            console.log('🔄 Renames detected, scanning orders to update...');
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*');

            if (ordersError) throw ordersError;

            for (const order of orders || []) {
                let items = [];
                let orderUpdated = false;

                try {
                    items = JSON.parse(order.items);
                } catch (e) {
                    continue;
                }

                if (!Array.isArray(items)) continue;

                items.forEach(item => {
                    if (item.id === 'shipping' || item.id === 'coupon') return;

                    const pId = item.id;

                    // Update product name in order
                    if (renamedProductNames[pId] && item.name !== renamedProductNames[pId]) {
                        console.log(`Order #${order.id}: Updating product name "${item.name}" -> "${renamedProductNames[pId]}"`);
                        item.name = renamedProductNames[pId];
                        orderUpdated = true;
                    }

                    // Update color name in order
                    if (renamedColors[pId] && renamedColors[pId][item.color]) {
                        const newColor = renamedColors[pId][item.color];
                        console.log(`Order #${order.id}: Updating color "${item.color}" -> "${newColor}"`);
                        item.color = newColor;
                        orderUpdated = true;
                    }

                    // Update size name in order
                    if (renamedSizes[pId] && renamedSizes[pId][item.size]) {
                        const newSize = renamedSizes[pId][item.size];
                        console.log(`Order #${order.id}: Updating size "${item.size}" -> "${newSize}"`);
                        item.size = newSize;
                        orderUpdated = true;
                    }
                });

                if (orderUpdated) {
                    const { error } = await supabase
                        .from('orders')
                        .update({ items: JSON.stringify(items) })
                        .eq('id', order.id);

                    if (error) console.error(`Error updating order #${order.id}:`, error);
                }
            }
        }

        console.log('✅ Database synchronization completed successfully!');
        return { success: true };
    } catch (e) {
        console.error('❌ Error during database sync:', e);
        return { success: false, error: e.message };
    }
}

module.exports = {
    syncDatabase
};
