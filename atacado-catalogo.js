/* ========== ATACADO LOGIC ========== */

let atacadoCart = [];
const MIN_PIECES = 30;
const CATALOG_PASSWORD = 'VERAO'; // Senha hardcoded (o dono passará isso no WhatsApp)
// Note: products and WHATSAPP_NUMBER are loaded from products.js

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    const isAuth = localStorage.getItem('surdeasia_atacado_auth');
    if (isAuth === 'true') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('catalog-content').style.display = 'block';
        renderCatalog();
        updateCartUI();
    } else {
        document.getElementById('login-overlay').style.display = 'flex';
        document.getElementById('catalog-content').style.display = 'none';
    }
}

function loginCatalog() {
    const input = document.getElementById('catalog-password-input').value.trim().toUpperCase();
    const errorEl = document.getElementById('login-error');
    
    if (input === CATALOG_PASSWORD) {
        localStorage.setItem('surdeasia_atacado_auth', 'true');
        checkAuth();
    } else {
        errorEl.textContent = 'Senha incorreta. Solicite a senha via WhatsApp.';
        errorEl.style.display = 'block';
    }
}

function getWholesalePrice(retailPrice) {
    return retailPrice * 0.60;
}

function formatPrice(num) {
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    grid.innerHTML = products.map(p => {
        const wholesalePrice = getWholesalePrice(p.priceNum);
        const defaultColor = p.colors[0]?.name || '';
        const defaultSize = p.sizes[0] || '';
        
        return `
            <div class="cat-card" id="card-${p.id}">
                <img src="${p.image}" alt="${p.name}" class="cat-card-img" id="img-${p.id}">
                <div class="cat-card-body">
                    <div class="cat-card-category">${p.category}</div>
                    <h3 class="cat-card-title">${p.name}</h3>
                    
                    <div class="cat-price-box">
                        <div class="cat-price-retail">Varejo: ${p.price}</div>
                        <div class="cat-price-wholesale">
                            ${formatPrice(wholesalePrice)} <span>Atacado (-40%)</span>
                        </div>
                    </div>

                    <div class="cat-options">
                        <span class="cat-option-label">Cores</span>
                        <div class="cat-colors" id="colors-${p.id}">
                            ${p.colors.map((c, i) => `
                                <div class="cat-color ${i === 0 ? 'active' : ''}" 
                                     style="background: ${c.hex}" 
                                     title="${c.name}"
                                     onclick="selectColor(${p.id}, '${c.name}', '${c.image}', this)"></div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="cat-options">
                        <span class="cat-option-label">Tamanho</span>
                        <div class="cat-sizes" id="sizes-${p.id}">
                            ${p.sizes.map((s, i) => `
                                <div class="cat-size ${i === 0 ? 'active' : ''}" 
                                     onclick="selectSize(${p.id}, '${s}', this)">${s}</div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="cat-actions">
                        <div class="cat-qty">
                            <button onclick="changeQty(${p.id}, -1)">-</button>
                            <input type="text" id="qty-${p.id}" value="1" readonly>
                            <button onclick="changeQty(${p.id}, 1)">+</button>
                        </div>
                        <button class="cat-add-btn" onclick="addToCart(${p.id})">Adicionar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// -- Selection Logic --
const selections = {};

function initSelection(id) {
    if (!selections[id]) {
        const p = products.find(x => x.id === id);
        selections[id] = {
            color: p.colors[0]?.name || '',
            size: p.sizes[0] || '',
            qty: 1
        };
    }
}

function selectColor(id, colorName, imageUrl, el) {
    initSelection(id);
    selections[id].color = colorName;
    
    // Update active class
    const parent = document.getElementById(`colors-${id}`);
    parent.querySelectorAll('.cat-color').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    
    // Update image
    if (imageUrl) {
        document.getElementById(`img-${id}`).src = imageUrl;
    }
}

function selectSize(id, size, el) {
    initSelection(id);
    selections[id].size = size;
    
    const parent = document.getElementById(`sizes-${id}`);
    parent.querySelectorAll('.cat-size').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}

function changeQty(id, delta) {
    initSelection(id);
    let newQty = selections[id].qty + delta;
    if (newQty < 1) newQty = 1;
    selections[id].qty = newQty;
    document.getElementById(`qty-${id}`).value = newQty;
}

// -- Cart Logic --
function addToCart(id) {
    initSelection(id);
    const p = products.find(x => x.id === id);
    const sel = selections[id];
    
    // Check if exactly this item already exists
    const existing = atacadoCart.find(item => item.id === id && item.color === sel.color && item.size === sel.size);
    
    if (existing) {
        existing.qty += sel.qty;
    } else {
        atacadoCart.push({
            id: p.id,
            name: p.name,
            wholesalePrice: getWholesalePrice(p.priceNum),
            color: sel.color,
            size: sel.size,
            qty: sel.qty
        });
    }
    
    // Reset Qty input to 1 after adding
    selections[id].qty = 1;
    document.getElementById(`qty-${id}`).value = 1;
    
    showToast(`${sel.qty}x ${p.name} adicionado(s)!`);
    updateCartUI();
}

function updateCartUI() {
    const totalQty = atacadoCart.reduce((sum, item) => sum + item.qty, 0);
    const totalValue = atacadoCart.reduce((sum, item) => sum + (item.wholesalePrice * item.qty), 0);
    
    const qtyEl = document.getElementById('cart-qty');
    const totalEl = document.getElementById('cart-total');
    const btn = document.getElementById('cart-btn');
    const breakdown = document.getElementById('cart-breakdown');
    
    qtyEl.textContent = `${totalQty} / ${MIN_PIECES}`;
    totalEl.textContent = formatPrice(totalValue);
    
    if (totalQty >= MIN_PIECES) {
        qtyEl.classList.add('ready');
        btn.disabled = false;
        btn.textContent = 'Finalizar Pedido Atacado';
        btn.onclick = finishWholesaleOrder;
        
        // Show breakdown
        breakdown.style.display = 'flex';
        document.getElementById('cart-sinal').textContent = formatPrice(totalValue * 0.5);
        document.getElementById('cart-envio').textContent = formatPrice(totalValue * 0.5);
    } else {
        qtyEl.classList.remove('ready');
        btn.disabled = true;
        const missing = MIN_PIECES - totalQty;
        btn.textContent = `Faltam ${missing} peça${missing > 1 ? 's' : ''}`;
        breakdown.style.display = 'none';
    }
}

function finishWholesaleOrder() {
    const totalQty = atacadoCart.reduce((sum, item) => sum + item.qty, 0);
    const totalValue = atacadoCart.reduce((sum, item) => sum + (item.wholesalePrice * item.qty), 0);
    const halfValue = totalValue * 0.5;
    
    let msg = `*NOVO PEDIDO ATACADO SURDEASIA*\n\n`;
    msg += `*Itens Selecionados:*\n`;
    
    atacadoCart.forEach(item => {
        msg += `▪ ${item.qty}x ${item.name} (${item.color} | ${item.size}) - ${formatPrice(item.wholesalePrice)} un.\n`;
    });
    
    msg += `\n*RESUMO FINANCEIRO*\n`;
    msg += `Total de Peças: ${totalQty}\n`;
    msg += `Valor Total Atacado: *${formatPrice(totalValue)}*\n`;
    msg += `Sinal (50%): *${formatPrice(halfValue)}*\n`;
    msg += `Saldo no Envio (50%): *${formatPrice(halfValue)}*\n\n`;
    msg += `Gostaria de prosseguir com a confirmação deste pedido e alinhar prazos de entrega.`;
    
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
