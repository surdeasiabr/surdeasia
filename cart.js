/**
 * SURDEASIA — Shopping Cart Module
 * Manages cart state, UI drawer, and localStorage persistence
 */

const SurdeCart = (() => {
    let items = [];
    let isOpen = false;
    let appliedCoupon = null; // { code, value_cents }

    // ── Load from localStorage ──
    function load() {
        try {
            const saved = localStorage.getItem('surdeasia_cart');
            items = saved ? JSON.parse(saved) : [];
            const savedCoupon = localStorage.getItem('surdeasia_coupon');
            if (savedCoupon) appliedCoupon = JSON.parse(savedCoupon);
        } catch { items = []; appliedCoupon = null; }
        updateBadge();
    }

    function save() {
        localStorage.setItem('surdeasia_cart', JSON.stringify(items));
        if (appliedCoupon) {
            localStorage.setItem('surdeasia_coupon', JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem('surdeasia_coupon');
        }
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
    function getTotal() {
        let subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        if (appliedCoupon) {
            subtotal = Math.max(0, subtotal - (appliedCoupon.value_cents / 100));
        }
        return subtotal;
    }

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
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            if (appliedCoupon) {
                const discountAmount = appliedCoupon.value_cents / 100;
                document.getElementById('cart-discount-row').style.display = 'flex';
                document.getElementById('cart-discount-value').textContent = `- R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
                document.getElementById('cart-coupon-msg').className = 'cart-coupon-message success';
                document.getElementById('cart-coupon-msg').textContent = `Cupom ${appliedCoupon.code} aplicado!`;
                document.getElementById('cart-coupon-msg').style.display = 'block';
                document.getElementById('cart-coupon-input').value = '';
                document.getElementById('cart-coupon-area').style.display = 'none';
            } else {
                document.getElementById('cart-discount-row').style.display = 'none';
                document.getElementById('cart-coupon-area').style.display = 'flex';
                document.getElementById('cart-coupon-msg').style.display = 'none';
            }
            
            totalEl.textContent = `R$ ${getTotal().toFixed(2).replace('.', ',')}`;
        }
    }

    function showAddedFeedback() {
        const toast = document.getElementById('cart-toast');
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ── WhatsApp Cart Message ──
    function buildWhatsAppCartMessage() {
        const lines = [
            `Olá! Gostaria de fazer um pedido 🛍️`,
            ``
        ];

        items.forEach((item, i) => {
            const subtotal = item.price * item.quantity;
            lines.push(`*${i + 1}. ${item.name}*`);
            lines.push(`   🎨 Cor: ${item.color}`);
            lines.push(`   📏 Tamanho: ${item.size}`);
            lines.push(`   🔢 Quantidade: ${item.quantity}`);
            lines.push(`   💰 Preço unitário: ${item.priceFormatted}`);
            if (item.quantity > 1) {
                lines.push(`   💵 Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}`);
            }
            lines.push(``);
        });

        if (appliedCoupon) {
            const discount = appliedCoupon.value_cents / 100;
            lines.push(`🎫 *Cupom/Vale:* ${appliedCoupon.code} (- R$ ${discount.toFixed(2).replace('.', ',')})`);
            lines.push(``);
        }

        const total = getTotal();
        lines.push(`━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`*💳 TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*`);
        lines.push(``);
        lines.push(`Poderia confirmar a disponibilidade e as formas de pagamento? 🙏`);

        return lines.join('\n');
    }

    function openWhatsAppCart() {
        if (items.length === 0) return;
        const WHATSAPP_NUMBER = '+5521972100797';
        const msg = encodeURIComponent(buildWhatsAppCartMessage());
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
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
                    <div class="cart-coupon-area" id="cart-coupon-area">
                        <input type="text" id="cart-coupon-input" placeholder="Possui cupom/vale?">
                        <button onclick="SurdeCart.applyCoupon()">Aplicar</button>
                    </div>
                    <div id="cart-coupon-msg" class="cart-coupon-message"></div>
                    <div class="cart-discount-row" id="cart-discount-row">
                        <span>Desconto</span>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <strong id="cart-discount-value">- R$ 0,00</strong>
                            <button onclick="SurdeCart.removeCoupon()" style="background:none;border:none;color:#dc3545;font-size:12px;cursor:pointer;text-decoration:underline;">Remover</button>
                        </div>
                    </div>
                    <div class="cart-total-row">
                        <span>Total</span>
                        <strong id="cart-total">R$ 0,00</strong>
                    </div>
                    <button class="btn btn-cart-checkout" id="cart-checkout-btn">
                        Finalizar Compra
                    </button>
                    <button class="btn btn-cart-whatsapp" id="cart-whatsapp-btn" onclick="SurdeCart.openWhatsAppCart()">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Pedir pelo WhatsApp
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

    async function applyCoupon() {
        const input = document.getElementById('cart-coupon-input');
        if (!input) return;
        const code = input.value.trim();
        const msgEl = document.getElementById('cart-coupon-msg');
        
        if (!code) return;
        
        try {
            msgEl.style.display = 'block';
            msgEl.className = 'cart-coupon-message';
            msgEl.textContent = 'Validando...';
            
            const res = await fetch(`/api/coupons/validate/${code}`);
            const data = await res.json();
            
            if (data.valid) {
                appliedCoupon = { code: code.toUpperCase(), value_cents: data.value_cents };
                save();
                renderDrawer();
            } else {
                msgEl.className = 'cart-coupon-message error';
                msgEl.textContent = data.error || 'Cupom inválido.';
                setTimeout(() => { if (!appliedCoupon) msgEl.style.display = 'none'; }, 3000);
            }
        } catch (e) {
            msgEl.className = 'cart-coupon-message error';
            msgEl.textContent = 'Erro ao validar cupom.';
        }
    }

    function removeCoupon() {
        appliedCoupon = null;
        save();
        renderDrawer();
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
        renderDrawer,
        openWhatsAppCart,
        applyCoupon,
        removeCoupon
    };
})();

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SurdeCart.init();
});
