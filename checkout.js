/**
 * SURDEASIA — Checkout Page Logic (Mercado Pago + Frete Correios)
 * Collects customer data, calculates shipping, sends to server, redirects to Mercado Pago
 */

const API_BASE = window.location.origin;
let cartItems = [];
let appliedCoupon = null;
let selectedShipping = null;

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderSummary();
    setupInputMasks();
    loadCustomerData();
});

function loadCart() {
    try {
        const saved = localStorage.getItem('surdeasia_cart');
        cartItems = saved ? JSON.parse(saved) : [];
        const savedCoupon = localStorage.getItem('surdeasia_coupon');
        if (savedCoupon) appliedCoupon = JSON.parse(savedCoupon);
    } catch { cartItems = []; appliedCoupon = null; }

    if (cartItems.length === 0) {
        window.location.href = '/';
    }
}

// ── Render Order Summary ──
function renderSummary() {
    const container = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    if (!container) return;

    container.innerHTML = cartItems.map(item => `
        <div class="summary-item">
            <div class="summary-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="summary-item-info">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-variant">${item.color} · ${item.size} · Qtd: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
        </div>
    `).join('');

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    
    let summaryHtml = '';
    if (appliedCoupon) {
        const discountAmount = appliedCoupon.value_cents / 100;
        summaryHtml = `
            <div class="summary-row" style="color: #2E7D32; margin-top: -10px; margin-bottom: 15px;">
                <span>Desconto (${appliedCoupon.code})</span>
                <span>- R$ ${discountAmount.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (appliedCoupon) {
        subtotalEl.insertAdjacentHTML('afterend', summaryHtml);
    }
    updateTotal();
}

function updateTotal() {
    let subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    if (appliedCoupon) {
        subtotal = Math.max(0, subtotal - (appliedCoupon.value_cents / 100));
    }
    const shippingCost = selectedShipping ? selectedShipping.price : 0;
    const total = subtotal + shippingCost;

    const totalEl = document.getElementById('summary-total');
    const shippingEl = document.getElementById('summary-shipping');

    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (shippingEl && selectedShipping) {
        shippingEl.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
        shippingEl.classList.remove('shipping-tbd');
    }
}

// ── Shipping Calculation ──
async function calculateShipping(cep) {
    const shippingSection = document.getElementById('shipping-options');
    const shippingLoading = document.getElementById('shipping-loading');
    
    if (!shippingSection) return;

    shippingLoading.style.display = 'flex';
    shippingSection.style.display = 'block';
    document.getElementById('shipping-results').innerHTML = '';

    const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

    try {
        const res = await fetch(`${API_BASE}/api/shipping/calculate?cep=${cep}&items=${itemCount}`);
        const data = await res.json();

        shippingLoading.style.display = 'none';

        if (data.success && data.options.length > 0) {
            document.getElementById('shipping-results').innerHTML = data.options.map((opt, i) => `
                <label class="shipping-option ${i === 0 ? 'selected' : ''}" onclick="selectShipping(${i})">
                    <input type="radio" name="shipping" value="${i}" ${i === 0 ? 'checked' : ''}>
                    <div class="shipping-option-info">
                        <strong>${opt.service}</strong>
                        <span>${opt.daysText}</span>
                    </div>
                    <div class="shipping-option-price">${opt.priceFormatted}</div>
                </label>
            `).join('');

            // Store options and auto-select first
            window._shippingOptions = data.options;
            selectShipping(0);
        } else {
            document.getElementById('shipping-results').innerHTML = `
                <p class="shipping-error">Não foi possível calcular o frete para este CEP. Entre em contato pelo WhatsApp.</p>
            `;
        }
    } catch (err) {
        shippingLoading.style.display = 'none';
        console.error('Shipping error:', err);
        document.getElementById('shipping-results').innerHTML = `
            <p class="shipping-error">Erro ao calcular frete. Tente novamente.</p>
        `;
    }
}

function selectShipping(index) {
    const options = window._shippingOptions;
    if (!options || !options[index]) return;

    selectedShipping = options[index];

    // Update visual selection
    document.querySelectorAll('.shipping-option').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
        el.querySelector('input').checked = i === index;
    });

    updateTotal();
}

// ── Validate form ──
function validateForm() {
    const fields = [
        'customer-name', 'customer-email', 'customer-phone', 'customer-cpf',
        'address-cep', 'address-street', 'address-number',
        'address-neighborhood', 'address-city', 'address-state'
    ];

    let valid = true;
    let firstInvalid = null;

    fields.forEach(id => {
        const input = document.getElementById(id);
        if (!input.value.trim()) {
            input.classList.add('error');
            valid = false;
            if (!firstInvalid) firstInvalid = input;
        } else {
            input.classList.remove('error');
        }
    });

    // Validate email
    const email = document.getElementById('customer-email');
    if (email.value && !email.value.includes('@')) {
        email.classList.add('error');
        valid = false;
        if (!firstInvalid) firstInvalid = email;
    }

    // Validate CPF (11 digits)
    const cpf = document.getElementById('customer-cpf').value.replace(/\D/g, '');
    if (cpf.length !== 11) {
        document.getElementById('customer-cpf').classList.add('error');
        valid = false;
        if (!firstInvalid) firstInvalid = document.getElementById('customer-cpf');
    }

    // Must select shipping
    if (!selectedShipping) {
        if (document.getElementById('shipping-loading').style.display === 'flex') {
            alert('Aguarde um momento, estamos calculando as opções de frete...');
        } else {
            alert('Não foi possível carregar o frete. Verifique o CEP digitado.');
        }
        document.getElementById('address-cep').focus();
        return false;
    }

    if (!valid && firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
}

// ── Process Checkout ──
async function processCheckout() {
    if (!validateForm()) return;

    const spinner = document.getElementById('pay-spinner');
    const btnText = document.getElementById('pay-btn-text');
    const btn = document.getElementById('btn-pay');

    spinner.style.display = 'inline';
    btnText.textContent = 'Preparando pagamento...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    const customer = {
        name: document.getElementById('customer-name').value.trim(),
        email: document.getElementById('customer-email').value.trim(),
        phone: document.getElementById('customer-phone').value.replace(/\D/g, ''),
        cpf: document.getElementById('customer-cpf').value.replace(/\D/g, ''),
        address: {
            cep: document.getElementById('address-cep').value.replace(/\D/g, ''),
            street: document.getElementById('address-street').value.trim(),
            number: document.getElementById('address-number').value.trim(),
            complement: document.getElementById('address-complement').value.trim(),
            neighborhood: document.getElementById('address-neighborhood').value.trim(),
            city: document.getElementById('address-city').value.trim(),
            state: document.getElementById('address-state').value.trim().toUpperCase()
        }
    };

    const items = cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color
    }));

    // Add shipping as an item
    if (selectedShipping) {
        items.push({
            id: 'shipping',
            name: `Frete ${selectedShipping.service} (${selectedShipping.daysText})`,
            price: selectedShipping.price,
            quantity: 1,
            size: '',
            color: ''
        });
    }

    // Save customer data for future purchases
    saveCustomerData({
        name: document.getElementById('customer-name').value.trim(),
        email: document.getElementById('customer-email').value.trim(),
        phone: document.getElementById('customer-phone').value,
        cpf: document.getElementById('customer-cpf').value,
        address_cep: document.getElementById('address-cep').value,
        address_street: document.getElementById('address-street').value.trim(),
        address_number: document.getElementById('address-number').value.trim(),
        address_complement: document.getElementById('address-complement').value.trim(),
        address_neighborhood: document.getElementById('address-neighborhood').value.trim(),
        address_city: document.getElementById('address-city').value.trim(),
        address_state: document.getElementById('address-state').value.trim().toUpperCase()
    });

    try {
        const payload = { 
            customer, 
            items,
            coupon_code: appliedCoupon ? appliedCoupon.code : null
        };

        const response = await fetch(`${API_BASE}/api/pay/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem('surdeasia_cart');
            localStorage.removeItem('surdeasia_coupon');
            window.location.href = data.checkoutUrl || data.sandboxUrl;
        } else {
            alert(data.message || 'Erro ao processar. Tente novamente.');
            resetButton();
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Erro de conexão. Verifique sua internet e tente novamente.');
        resetButton();
    }
}

function resetButton() {
    document.getElementById('pay-spinner').style.display = 'none';
    document.getElementById('pay-btn-text').textContent = 'Ir para Pagamento Seguro';
    document.getElementById('btn-pay').disabled = false;
    document.getElementById('btn-pay').style.opacity = '1';
}

// ── Save/Load Customer Data ──
function saveCustomerData(data) {
    localStorage.setItem('surdeasia_customer', JSON.stringify(data));
}

function loadCustomerData() {
    try {
        const saved = localStorage.getItem('surdeasia_customer');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.name) document.getElementById('customer-name').value = data.name;
            if (data.email) document.getElementById('customer-email').value = data.email;
            if (data.phone) document.getElementById('customer-phone').value = data.phone;
            if (data.cpf) document.getElementById('customer-cpf').value = data.cpf;
            if (data.address_cep) {
                document.getElementById('address-cep').value = data.address_cep;
                // Auto trigger fetch if full CEP is present
                if (data.address_cep.replace(/\D/g, '').length === 8) {
                    fetchAddress(data.address_cep.replace(/\D/g, ''));
                    calculateShipping(data.address_cep.replace(/\D/g, ''));
                }
            }
            if (data.address_street) document.getElementById('address-street').value = data.address_street;
            if (data.address_number) document.getElementById('address-number').value = data.address_number;
            if (data.address_complement) document.getElementById('address-complement').value = data.address_complement;
            if (data.address_neighborhood) document.getElementById('address-neighborhood').value = data.address_neighborhood;
            if (data.address_city) document.getElementById('address-city').value = data.address_city;
            if (data.address_state) document.getElementById('address-state').value = data.address_state;
        }
    } catch (err) { console.error('Error loading customer data:', err); }
}

// ── Input Masks ──
function setupInputMasks() {
    // CPF: 000.000.000-00
    document.getElementById('customer-cpf')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        e.target.value = v;
    });

    // Phone: (00) 00000-0000
    document.getElementById('customer-phone')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
        e.target.value = v;
    });

    // CEP: 00000-000 + auto-fill + shipping calc
    document.getElementById('address-cep')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
        e.target.value = v;
        if (e.target.value.replace(/\D/g, '').length === 8) {
            fetchAddress(e.target.value.replace(/\D/g, ''));
            calculateShipping(e.target.value.replace(/\D/g, ''));
        }
    });

    // Remove error on typing
    document.querySelectorAll('.form-group input').forEach(input => {
        input.addEventListener('input', () => input.classList.remove('error'));
    });
}

// ── CEP auto-fill ──
async function fetchAddress(cep) {
    const loader = document.getElementById('cep-loader');
    loader.style.display = 'inline';
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
            document.getElementById('address-street').value = data.logradouro || '';
            document.getElementById('address-neighborhood').value = data.bairro || '';
            document.getElementById('address-city').value = data.localidade || '';
            document.getElementById('address-state').value = data.uf || '';
            document.getElementById('address-number').focus();
        }
    } catch (err) { console.error('CEP error:', err); }
    loader.style.display = 'none';
}
