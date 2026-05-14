/**
 * SURDEASIA — Shopping Cart Module
 * Manages cart state, UI drawer, and localStorage persistence
 */

const SurdeCart = (() => {
    let items = [];
    let isOpen = false;

    // ── Load from localStorage ──
    function load() {
        try {
            const saved = localStorage.getItem('surdeasia_cart');
            items = saved ? JSON.parse(saved) : [];
        } catch { items = []; }
        updateBadge();
    }

    function save() {
        localStorage.setItem('surdeasia_cart', JSON.stringify(items));
        updateBadge();
    }

    // ── Cart operations ──
    function addItem(product, selectedSize, selectedColor, quantity = 1) {
        const key = `${product.id}-${selectedSize}-${selectedColor}`;
        const existing = items.find(i => i.key === key);

        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({
                key,
                id: product.id,
                name: product.name,
                price: product.priceNum,
                priceFormatted: product.price,
                image: product.image,
                size: selectedSize,
                color: selectedColor,
                quantity
            });
        }
        save();
        renderDrawer();
        openDrawer();
        showAddedFeedback();
    }

    function removeItem(key) {
        items = items.filter(i => i.key !== key);
        save();
        renderDrawer();
    }

    function updateQuantity(key, delta) {
        const item = items.find(i => i.key === key);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeItem(key);
            return;
        }
        save();
        renderDrawer();
    }

    function clear() {
        items = [];
        save();
        renderDrawer();
    }

    function getItems() { return items; }
    function getCount() { return items.reduce((s, i) => s + i.quantity, 0); }
    function getTotal() { return items.reduce((s, i) => s + i.price * i.quantity, 0); }

    // ── Badge ──
    function updateBadge() {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        const count = getCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // ── Drawer UI ──
    function openDrawer() {
        isOpen = true;
        const overlay = document.getElementById('cart-overlay');
        const drawer = document.getElementById('cart-drawer');
        if (overlay) overlay.classList.add('active');
        if (drawer) drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        isOpen = false;
        const overlay = document.getElementById('cart-overlay');
        const drawer = document.getElementById('cart-drawer');
        if (overlay) overlay.classList.remove('active');
        if (drawer) drawer.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderDrawer() {
        const list = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total');
        const emptyMsg = document.getElementById('cart-empty');
        const footer = document.getElementById('cart-footer');
        if (!list) return;

        if (items.length === 0) {
            list.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (footer) footer.style.display = 'none';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';
        if (footer) footer.style.display = 'block';

        list.innerHTML = items.map(item => `
            <div class="cart-item" data-key="${item.key}">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-variant">${item.color} · ${item.size}</p>
                    <p class="cart-item-price">${item.priceFormatted}</p>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="SurdeCart.updateQuantity('${item.key}', -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="SurdeCart.updateQuantity('${item.key}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="SurdeCart.removeItem('${item.key}')" aria-label="Remover">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
        `).join('');

        if (totalEl) {
            totalEl.textContent = `R$ ${getTotal().toFixed(2).replace('.', ',')}`;
        }
    }

    function showAddedFeedback() {
        const toast = document.getElementById('cart-toast');
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ── Init ──
    function init() {
        load();
        injectCartUI();
        renderDrawer();

        // Cart icon click
        document.getElementById('cart-icon-btn')?.addEventListener('click', () => {
            if (isOpen) closeDrawer(); else { renderDrawer(); openDrawer(); }
        });

        // Close drawer
        document.getElementById('cart-close')?.addEventListener('click', closeDrawer);
        document.getElementById('cart-overlay')?.addEventListener('click', closeDrawer);

        // Checkout button
        document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
            if (items.length === 0) return;
            closeDrawer();
            window.location.href = '/checkout';
        });
    }

    function injectCartUI() {
        // ── Cart icon in navbar ──
        const navInner = document.querySelector('.nav-inner');
        if (navInner && !document.getElementById('cart-icon-btn')) {
            const cartBtn = document.createElement('button');
            cartBtn.id = 'cart-icon-btn';
            cartBtn.className = 'cart-icon-btn';
            cartBtn.setAttribute('aria-label', 'Carrinho');
            cartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span class="cart-badge" id="cart-badge" style="display:none;">0</span>
            `;
            navInner.appendChild(cartBtn);
        }

        // ── Cart drawer overlay ──
        if (!document.getElementById('cart-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'cart-overlay';
            overlay.className = 'cart-overlay';
            document.body.appendChild(overlay);
        }

        // ── Cart drawer ──
        if (!document.getElementById('cart-drawer')) {
            const drawer = document.createElement('div');
            drawer.id = 'cart-drawer';
            drawer.className = 'cart-drawer';
            drawer.innerHTML = `
                <div class="cart-drawer-header">
                    <h3>Seu Carrinho</h3>
                    <button class="cart-close-btn" id="cart-close" aria-label="Fechar carrinho">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="cart-drawer-body">
                    <div class="cart-empty" id="cart-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="cart-empty-icon">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        <p>Seu carrinho está vazio</p>
                        <span>Explore nossa coleção e encontre peças incríveis</span>
                    </div>
                    <div class="cart-items" id="cart-items"></div>
                </div>
                <div class="cart-drawer-footer" id="cart-footer" style="display:none;">
                    <div class="cart-total-row">
                        <span>Total</span>
                        <strong id="cart-total">R$ 0,00</strong>
                    </div>
                    <button class="btn btn-cart-checkout" id="cart-checkout-btn">
                        Finalizar Compra
                    </button>
                    <button class="btn btn-cart-continue" onclick="SurdeCart.closeDrawer()">
                        Continuar Comprando
                    </button>
                </div>
            `;
            document.body.appendChild(drawer);
        }

        // ── Toast notification ──
        if (!document.getElementById('cart-toast')) {
            const toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.className = 'cart-toast';
            toast.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                <span>Adicionado ao carrinho</span>
            `;
            document.body.appendChild(toast);
        }
    }

    return {
        init,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        getItems,
        getCount,
        getTotal,
        openDrawer,
        closeDrawer,
        renderDrawer
    };
})();

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SurdeCart.init();
});
