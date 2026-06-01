/* ========== STOCK SYSTEM ========== */
let globalStockData = [];
let useStockSystem = false;

async function loadStock() {
    try {
        const response = await fetch('/api/estoque');
        const result = await response.json();
        if (result.useStock) {
            useStockSystem = true;
            globalStockData = result.data;
            console.log('Sistema de estoque (Planilha) ativado!', globalStockData);
        }
    } catch (e) {
        console.error('Erro ao carregar estoque', e);
    }
}

// Load stock on page load
document.addEventListener('DOMContentLoaded', loadStock);

/* ========== RENDER PRODUCTS ========== */
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(p => `
        <div class="product-card reveal" data-id="${p.id}">
            <div class="product-image" onclick="openModal(${p.id})">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-price">${p.price}</p>
                <div class="product-colors">
                    ${p.colors.map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join('')}
                </div>
                <div class="product-sizes">
                    ${p.sizes.map(s => `<span class="size-tag">${s}</span>`).join('')}
                </div>
                <div class="product-actions">
                    <button class="btn btn-product" onclick="openModal(${p.id})">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                        Adicionar
                    </button>
                    <button class="btn btn-product-outline" onclick="openModal(${p.id})">Ver detalhes</button>
                </div>
            </div>
        </div>
    `).join('');
}

/* ========== WHATSAPP ========== */
function openWhatsApp(name, price) {
    const msg = encodeURIComponent(`Olá! Tenho interesse na peça "${name}" (${price}). Poderia me ajudar?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

function openWhatsAppFromModal() {
    if (!currentModalProduct) return;
    const p = currentModalProduct;
    const color = selectedModalColor || (p.colors[0]?.name || '---');
    const size  = selectedModalSize  || p.sizes[0]  || '---';

    const lines = [
        'Ola! Gostaria de fazer um pedido',
        '',
        'Peca: ' + p.name,
        'Cor: ' + color,
        'Tamanho: ' + size,
        'Valor: ' + p.price,
        '',
        'Poderia confirmar a disponibilidade?'
    ];

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');
}

function updateModalWhatsAppLink() { /* now handled by openWhatsAppFromModal on click */ }

/* ========== MODAL ========== */
let currentModalProduct = null;
let selectedModalSize = null;
let selectedModalColor = null;

function normalizeStr(s) {
    if (!s) return '';
    return String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function checkStock(productId, size, color) {
    if (!useStockSystem) return true;
    const pId = String(productId);
    const pSize = normalizeStr(size);
    const pColor = normalizeStr(color);
    
    const item = globalStockData.find(s => 
        String(s.id) === pId && 
        normalizeStr(s.size) === pSize && 
        normalizeStr(s.color) === pColor
    );
    
    if (item) {
        return item.stock > 0;
    }
    return true; // Se não está na planilha, assume infinito
}

function updateModalStockUI() {
    const activeBtn = document.getElementById('modal-add-cart');
    if (!activeBtn) return;

    const hasStock = checkStock(currentModalProduct.id, selectedModalSize, selectedModalColor);
    
    if (!hasStock) {
        activeBtn.textContent = 'Esgotado';
        activeBtn.disabled = true;
        activeBtn.style.opacity = '0.5';
        activeBtn.style.cursor = 'not-allowed';
        activeBtn.style.pointerEvents = 'none';
    } else {
        activeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:18px;height:18px;"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Adicionar ao Carrinho`;
        activeBtn.disabled = false;
        activeBtn.style.opacity = '1';
        activeBtn.style.cursor = 'pointer';
        activeBtn.style.pointerEvents = 'auto';
    }
}



function openModal(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    currentModalProduct = p;
    selectedModalSize = p.sizes[0];
    selectedModalColor = p.colors[0]?.name || '';

    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-img').alt = p.name;
    
    const thumbsContainer = document.getElementById('modal-thumbnails');
    if (p.images && p.images.length > 1) {
        thumbsContainer.style.display = 'flex';
        thumbsContainer.innerHTML = p.images.map(img => 
            `<img src="${img}" style="width: 70px; height: 70px; object-fit: cover; cursor: pointer; border-radius: 4px; border: 1px solid #ddd; transition: 0.3s;" onclick="handleThumbnailClick('${img}')" onmouseover="this.style.borderColor='#888'" onmouseout="this.style.borderColor='#ddd'" alt="thumb">`
        ).join('');
    } else {
        thumbsContainer.style.display = 'none';
        thumbsContainer.innerHTML = '';
    }

    document.getElementById('modal-category').textContent = p.category;
    document.getElementById('modal-name').textContent = p.name;
    document.getElementById('modal-price').textContent = p.price;
    document.getElementById('modal-desc').textContent = p.desc;

    document.getElementById('modal-colors').innerHTML = p.colors.map((c, i) =>
        `<span class="color-dot ${i === 0 ? 'active' : ''}" style="background:${c.hex}" title="${c.name}" onclick="selectModalColor(this, '${c.name}')"></span>`
    ).join('');

    document.getElementById('modal-sizes').innerHTML = p.sizes.map((s, i) =>
        `<button class="size-btn ${i === 0 ? 'active' : ''}" onclick="selectModalSize(this, '${s}')">${s}</button>`
    ).join('');

    // Build detailed WhatsApp link with current selections
    updateModalWhatsAppLink();

    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize stock UI logic
    updateModalStockUI();
}

function handleThumbnailClick(imgSrc) {
    document.getElementById('modal-img').src = imgSrc;
    
    if (currentModalProduct && currentModalProduct.colors) {
        let matchingColor = null;
        
        const imgIndex = currentModalProduct.images?.indexOf(imgSrc);
        if (imgIndex !== -1) {
            matchingColor = currentModalProduct.colors.find(c => c.indices && c.indices.includes(imgIndex));
        }
        
        if (!matchingColor) {
            matchingColor = currentModalProduct.colors.find(c => c.image === imgSrc);
        }
        
        if (!matchingColor) {
            const lowercaseSrc = imgSrc.toLowerCase();
            matchingColor = currentModalProduct.colors.find(c => {
                const colorKeywords = c.name.toLowerCase().split(' ').filter(w => w.length > 2);
                return colorKeywords.some(keyword => lowercaseSrc.includes(keyword));
            });
        }
        
        if (matchingColor) {
            const dots = document.querySelectorAll('#modal-colors .color-dot');
            dots.forEach(dot => {
                if (dot.title === matchingColor.name) {
                    if (!dot.classList.contains('active')) {
                        selectedModalColor = matchingColor.name;
                        dots.forEach(d => d.classList.remove('active'));
                        dot.classList.add('active');
                        // Update stock UI when color changes via thumbnail
                        updateModalStockUI();
                    }
                }
            });
        }
    }
}

function selectModalSize(btn, size) {
    selectedModalSize = size;
    btn.closest('.size-options').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateModalWhatsAppLink();
}

function selectModalColor(dot, colorName) {
    selectedModalColor = colorName;
    dot.closest('.color-options').querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');

    if (currentModalProduct && currentModalProduct.colors) {
        const colorObj = currentModalProduct.colors.find(c => c.name === colorName);
        if (colorObj && colorObj.image) {
            document.getElementById('modal-img').src = colorObj.image;
        }
    }
    updateModalWhatsAppLink();
}

function addToCartFromModal() {
    if (!currentModalProduct) return;
    if (typeof SurdeCart !== 'undefined') {
        SurdeCart.addItem(currentModalProduct, selectedModalSize, selectedModalColor);
        closeModal();
    }
}

function quickAddToCart(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const size = p.sizes[0];
    const color = p.colors[0]?.name || '';
    if (typeof SurdeCart !== 'undefined') {
        SurdeCart.addItem(p, size, color);
    }
}

function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('product-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ========== NAVIGATION ========== */
const nav = document.getElementById('main-nav');
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');

toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
});

links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
    });
});

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ========== SCROLL REVEAL ========== */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

function initReveals() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ========== COUNTER ANIMATION ========== */
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.count);
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    initReveals();
    const statsSection = document.querySelector('.story-stats');
    if (statsSection) counterObserver.observe(statsSection);
});
