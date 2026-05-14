/* ========== PRODUCT DATA ========== */
const WHATSAPP_NUMBER = '+5521972100797';

const products = [
    {
        "id": 12,
        "name": "Vestido Aloha de Linho",
        "price": "R$ 385,00",
        "priceNum": 385,
        "image": "images/Vestido Aloha Branco Linho 123.png",
        "images": [
            "images/Vestido Aloha Branco Linho 123.png",
            "images/Vestido Aloha 33.png",
            "images/Vestido Aloha Branco y Chemisse Amarela.png",
            "images/Vestido Aloha Linho Azul Marinho 100.png",
            "images/Vestido Aloha Linho Azul Marinho 200.png",
            "images/Vestido Aloha de Linho 20211.png"
        ],
        "category": "Vestidos",
        "badge": "Novo",
        "colors": [
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Vestido Aloha Branco Linho 123.png" },
            { "name": "Azul Marinho", "hex": "#000080", "image": "images/Vestido Aloha Linho Azul Marinho 100.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Vestido confeccionado em linho premium, disponível em branco e azul marinho. Peça única que une conforto absoluto a um visual charmoso e sofisticado."
    },
    {
        "id": 17,
        "name": "Vestido Aloha Viscosa",
        "price": "R$ 380,00",
        "priceNum": 380,
        "image": "images/Vestido Aloha e Faixa 3.png",
        "images": [
            "images/Vestido Aloha e Faixa 3.png",
            "images/Vestido Aloha e Faixa 2.png",
            "images/Vestido Aloha e faixa.png"
        ],
        "category": "Vestidos",
        "badge": "Novo",
        "colors": [
            { "name": "Bege", "hex": "#D5C4B3", "image": "images/Vestido Aloha e Faixa 3.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Deslumbrante vestido em voil de viscose, desenhado com um corte assimétrico: mais curto na frente e alongado atrás. A leveza do tecido cria um movimento fluido e apaixonante a cada passo que você dá."
    },
    {
        "id": 11,
        "name": "Vestido Saint Tropez",
        "price": "R$ 380,00",
        "priceNum": 380,
        "image": "images/Saia Saint Tropez 4.png",
        "images": [
            "images/Saia Saint Tropez 4.png",
            "images/Vestido Saint Tropez Branco 1010.png",
            "images/Vestido Saint Tropez Branco 2020.png"
        ],
        "category": "Vestidos",
        "badge": "Novo",
        "colors": [
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Saia Saint Tropez 4.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Vestido longo esvoaçante e estruturado em camadas, na cor branca. Perfeito para quem busca leveza e elegância em cada movimento."
    },
    {
        "id": 13,
        "name": "Vestido Mahalo",
        "price": "R$ 380,00",
        "priceNum": 380,
        "image": "images/Vestido Mahalo Branco 1011.png",
        "images": [
            "images/Vestido Mahalo Branco 1011.png",
            "images/Vestido Mahalo Branco 1012.png",
            "images/Vestido Mahalo Branco 1113.png",
            "images/Vestido Mahalo Branco 1114.png"
        ],
        "category": "Vestidos",
        "badge": "Novo",
        "colors": [
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Vestido Mahalo Branco 1011.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Vestido feito de linho. Uma peça super romântica e elegante."
    },
    {
        "id": 14,
        "name": "Vestidao Kuta",
        "price": "R$ 390,00",
        "priceNum": 390,
        "image": "images/Vestidao Kuta 100.png",
        "images": [
            "images/Vestidao Kuta 100.png",
            "images/Vestidao Kuta 200.png",
            "images/Vestidao Kuta 300.png"
        ],
        "category": "Vestidos",
        "badge": "Novo",
        "colors": [
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Vestidao Kuta 100.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Vestido elegante com botões de madrepérola, confeccionado em voil de viscose branca. Caimento leve e fluido, perfeito para os dias quentes com um toque de sofisticação e conforto."
    },
    {
        "id": 15,
        "name": "Chemisse Dulu Classic",
        "price": "R$ 420,00",
        "priceNum": 420,
        "image": "images/Chemisse Classic verde seco 101.jpeg",
        "images": [
            "images/Chemisse Classic verde seco 101.jpeg",
            "images/Chemisse Classic verde seco 102.jpeg",
            "images/Chemisse Classic verde seco 103.jpeg",
            "images/Chemisse Classic Verde Seco 104.jpeg",
            "images/Chemisse Classic Bege 105.jpeg",
            "images/Chemisse Classic Listra Bordo 106.jpeg",
            "images/Chemisse Classic Listra Bordo 107.jpeg"
        ],
        "category": "Camisas",
        "badge": "Novo",
        "colors": [
            { "name": "Verde", "hex": "#4CAF50", "image": "images/Chemisse Classic verde seco 101.jpeg" },
            { "name": "Bege", "hex": "#D5C4B3", "image": "images/Chemisse Classic Bege 105.jpeg" },
            { "name": "Bordô", "hex": "#800000", "image": "images/Chemisse Classic Listra Bordo 106.jpeg" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Chemisse elegante com manga clássica e botões de madrepérola. Confeccionada com tecidos nobres, esta peça traz o equilíbrio perfeito entre o conforto casual e a sofisticação atemporal. Ideal para compor looks versáteis em qualquer momento do dia."
    },
    {
        "id": 10,
        "name": "Chemisse Wave de Linho",
        "price": "R$ 420,00",
        "priceNum": 420,
        "image": "images/Chemisse De Linho Listrado Azul 222.png",
        "images": [
            "images/Chemisse De Linho Listrado Azul 222.png",
            "images/Chemisse Wave de Linho Branco 100A.png",
            "images/Chemisse Wave Branco Linho 1001.png",
            "images/Chemisse Wave Branco Linho 1002.png",
            "images/Chemisse Wave Listrado linho azul 123.png",
            "images/Chemisse Wave Azul Marinho Linho 2000.png",
            "images/Chemisse Wave Azul Marinho Linho 2001.png",
            "images/Chemisse wave de Linho Listrado Bege 100.png",
            "images/Chemisse de Linho Listrado Azul 111.png",
            "images/Chemisse de Linho Listrado Azul 333.png"
        ],
        "category": "Camisas",
        "badge": "Novo",
        "colors": [
            { "name": "Azul Listrado", "hex": "#4A81B8", "image": "images/Chemisse De Linho Listrado Azul 222.png" },
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Chemisse Wave de Linho Branco 100A.png" },
            { "name": "Azul Marinho", "hex": "#000080", "image": "images/Chemisse Wave Azul Marinho Linho 2000.png" },
            { "name": "Bege", "hex": "#D5C4B3", "image": "images/Chemisse wave de Linho Listrado Bege 100.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Chemisse Wave confeccionada em linho premium. Uma peça versátil e marcante que traz a essência do mar para o seu estilo."
    },
    {
        "id": 9,
        "name": "Chemisse Wave Algodao Listrado",
        "price": "R$ 420,00",
        "priceNum": 420,
        "image": "images/chemisse listrado algodao 1.jpeg",
        "images": [
            "images/chemisse listrado algodao 1.jpeg",
            "images/chemisse listrado algodao 2.jpeg",
            "images/Chemisse Listrado Algodao 3.png",
            "images/Chemisse Wave Algodao Listra ancha Bege 1001.png",
            "images/Chemisse Wave Algodao Listra ancha Bege 1002.png"
        ],
        "category": "Camisas",
        "badge": "Novo",
        "colors": [
            { "name": "Celeste Listrado", "hex": "#87CEEB", "image": "images/chemisse listrado algodao 1.jpeg" },
            { "name": "Bege Listrado", "hex": "#D5C4B3", "image": "images/Chemisse Wave Algodao Listra ancha Bege 1001.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Chemisse confeccionado em algodão premium com listras. Caimento impecável e frescor ideal para dias ensolarados."
    },
    {
        "id": 7,
        "name": "Chemisse Wave Voil Viscosa",
        "price": "R$ 380,00",
        "priceNum": 380,
        "image": "images/Chemisse de Voil Azul Stone 111.png",
        "images": [
            "images/Chemisse de Voil Azul Stone 111.png",
            "images/Chemisse de Voil Azul Stone 222.png",
            "images/Chemisse Wave Voil Viscosa 1.jpeg",
            "images/Chemisse Wave Voil Viscosa 2.jpeg",
            "images/Chemisse Wave Voil Viscosa 4.jpeg",
            "images/Chemisse Wave Voil Viscosa 5.jpeg",
            "images/Chemisse Viscosa Celeste 100.png",
            "images/Chemisse Viscosa Celeste 200.png",
            "images/Chemisse Wave Azul Viscosa Stoneado.png"
        ],
        "category": "Camisas",
        "badge": "Novo",
        "colors": [
            { "name": "Azul Stoneado", "hex": "#4A6B8A", "image": "images/Chemisse de Voil Azul Stone 111.png" },
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Chemisse Wave Voil Viscosa 1.jpeg" },
            { "name": "Celeste", "hex": "#87CEEB", "image": "images/Chemisse Viscosa Celeste 100.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Chemisse Wave em voil de viscose. Peça elegante, leve e fluida, perfeita para compor looks de verão com sofisticação."
    },
    {
        "id": 3,
        "name": "Calca Summer",
        "price": "R$ 350,00",
        "priceNum": 350,
        "image": "images/Calca Summer 1.png",
        "images": [
            "images/Calca Summer 1.png",
            "images/calca Summer 2.png",
            "images/Calca Summer 3.png",
            "images/Calca Summer 4.png"
        ],
        "category": "Calças",
        "colors": [
            { "name": "Branca", "hex": "#FFFFFF", "image": "images/Calca Summer 1.png" }
        ],
        "sizes": ["P/M", "M/G"],
        "desc": "Calça pantalona com camadas fluídas e design leve."
    },
    {
        "id": 16,
        "name": "Calca Dulu de Linho",
        "price": "R$ 350,00",
        "priceNum": 350,
        "image": "images/calca dulu 111.png",
        "images": [
            "images/calca dulu 111.png",
            "images/calca dulu 222.png",
            "images/Chemisse De Linho Listrado Azul 222.png",
            "images/Chemisse Wave Azul Marinho Linho 2000.png",
            "images/Vestido Aloha de Linho 20211.png",
            "images/Camisa Pontas Bege Stoneada 1005.png"
        ],
        "category": "Calças",
        "badge": "Novo",
        "colors": [
            { "name": "Azul Marinho", "hex": "#000080", "image": "images/calca dulu 111.png" },
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Chemisse De Linho Listrado Azul 222.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Calça de linho premium com faixa elástica na cintura. Uma peça que abraça o corpo com leveza, proporcionando total liberdade de movimento e um caimento incrivelmente elegante e despojado."
    },
    {
        "id": 1,
        "name": "Macacão Dulu",
        "price": "R$ 389,00",
        "priceNum": 389,
        "image": "images/Macacao Dulu 111.png",
        "images": [
            "images/Macacao Dulu 111.png",
            "images/Macacao Dulu 222.png",
            "images/Macacao Dulu 333.png",
            "images/Macacao dulu 444.png",
            "images/Macacao dulu 555.png"
        ],
        "category": "Macacões",
        "badge": "Novo",
        "colors": [
            { "name": "Branco", "hex": "#FFFFFF", "image": "images/Macacao Dulu 111.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Macacão longo perfeito para dias ensolarados à beira-mar. Caimento solto e elegante que acompanha o movimento do corpo, acompanhado de cinto. Disponível em linho e voil de viscosa."
    },
    {
        "id": 20,
        "name": "Macacao Dulu Viscosa",
        "price": "R$ 380,00",
        "priceNum": 380,
        "image": "images/Macacao Dulu Chocolate 106.png",
        "images": [
            "images/Macacao Dulu Chocolate 106.png",
            "images/Macacao Dulu Chocolate 100.png",
            "images/Macacao Dulu Chocolate 102.png",
            "images/Macacao Dulu Chocolate 103.png",
            "images/Macacao Dulu Chocolate 104.png",
            "images/Macacao Dulu Chocolate 105.png"
        ],
        "category": "Macacões",
        "badge": "Novo",
        "colors": [
            { "name": "Marrom Chocolate", "hex": "#3E2723", "image": "images/Macacao Dulu Chocolate 106.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Macacão de voil de viscose com acabamento Stone Wash e elástico no busto. Conforto e estilo em uma peça única."
    },
    {
        "id": 2,
        "name": "Saia Mahalo",
        "price": "R$ 350,00",
        "priceNum": 350,
        "image": "images/Saia Mahalo 112.png",
        "images": [
            "images/Saia Mahalo 112.png",
            "images/Saia Mahalo 111.png",
            "images/Saia Mahalo 113.png",
            "images/Saia Mahalo 114.png",
            "images/Saia Mahalo Verde Manzana 1.jpg",
            "images/Saia Mahalo Verde Manzana 2.jpg",
            "images/Saia Mahalo Rosa Viejo Voil de Viscosa 1.jpg",
            "images/Saia Mahalo Rosa Viejo Voil de Viscosa 2.jpg",
            "images/Saia Mahalo Bege 1.jpg",
            "images/Saia mahalo bege 2.jpeg",
            "images/Saia Mahalo Cinza 1.jpg",
            "images/Saia mahalo cinza 2.jpeg",
            "images/Saia Mahalo Azul Stone 1000.png",
            "images/Saia Mahalo Azul Stone 1001.png",
            "images/Saia Mahalo Azul Stone 1002.png"
        ],
        "category": "Saias",
        "colors": [
            { "name": "Verde Maçã", "hex": "#8DB600", "image": "images/Saia Mahalo 111.png" },
            { "name": "Verde Seco", "hex": "#4B5320", "image": "images/Saia Mahalo 112.png" },
            { "name": "Rosa Velho", "hex": "#C08081", "image": "images/Saia Mahalo Rosa Viejo Voil de Viscosa 1.jpg" },
            { "name": "Bege Claro", "hex": "#F5F5DC", "image": "images/Saia Mahalo Bege 1.jpg" },
            { "name": "Cinza", "hex": "#808080", "image": "images/Saia Mahalo Cinza 1.jpg" },
            { "name": "Azul Stoneado", "hex": "#4A6B8A", "image": "images/Saia Mahalo Azul Stone 1000.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Saia longa esvoaçante e elegante com cós ajustado. Perfeita para os dias de verão."
    },
    {
        "id": 4,
        "name": "Camisa Wave",
        "price": "R$ 340,00",
        "priceNum": 340,
        "image": "images/Camisa Wave Branca 11.png",
        "images": [
            "images/Camisa Wave Branca 11.png",
            "images/camisa wave 1.jpeg",
            "images/Camisa wave 2.jpeg",
            "images/Saia Mahalo Rosa Viejo Voil de Viscosa 2.jpg",
            "images/Saia Mahalo 111.png"
        ],
        "category": "Camisas",
        "badge": "Best Seller",
        "colors": [
            { "name": "Branca", "hex": "#FFFFFF", "image": "images/Camisa Wave Branca 11.png" }
        ],
        "sizes": ["M"],
        "desc": "Camisa elegante em voil de viscosa com babados esvoaçantes nas mangas. Possui botões de madrepérola. Às vezes é feita de linho ou de algodão."
    },
    {
        "id": 21,
        "name": "Camisa Pontas",
        "price": "R$ 340,00",
        "priceNum": 340,
        "image": "images/Camisa Pontas Bege Stoneada 1004.png",
        "images": [
            "images/Camisa Pontas Bege Stoneada 1004.png",
            "images/Camisa Pontas Bege Stoneada 1005.png",
            "images/Camisa Pontas Azul Stoneada 1000.png",
            "images/Camisa Pontas Azul Stoneada 1001.png",
            "images/Camisa Pontas Azul Jean 1002.png",
            "images/Camisa Pontas Azul Jean 1003.png",
            "images/Saia Mahalo 112.png",
            "images/imagen aislada 1.jpeg"
        ],
        "category": "Camisas",
        "badge": "Novo",
        "colors": [
            { "name": "Bege Chocolate", "hex": "#7B3F00", "image": "images/Camisa Pontas Bege Stoneada 1004.png" },
            { "name": "Azul Stoneado", "hex": "#4A6B8A", "image": "images/Camisa Pontas Azul Stoneada 1000.png" },
            { "name": "Azul Jeans", "hex": "#5D76A9", "image": "images/Camisa Pontas Azul Jean 1002.png" },
            { "name": "Verde Seco", "hex": "#4B5320", "image": "images/Saia Mahalo 112.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Camisa solta com botões de madrepérola e tecidos leves. Elegância e frescor."
    },
    {
        "id": 6,
        "name": "Camisa Marcela De Linho",
        "price": "R$ 380,00",
        "priceNum": 380,
        "image": "images/Camisa Marcela Listrada Verde 1111.png",
        "images": [
            "images/Camisa Marcela Listrada Verde 1111.png",
            "images/Camisa Marcela Listrada Verde 1110.png",
            "images/Camisa Marcela Listrada Verde 1112.png",
            "images/Camisa Marcela Listrada Verde 1113.png",
            "images/Camisa Marcela Listra Azul 1.png",
            "images/Camisa Marcela Listra Azul 2.png"
        ],
        "category": "Camisas",
        "colors": [
            { "name": "Verde Seco", "hex": "#8B8C65", "image": "images/Camisa Marcela Listrada Verde 1111.png" },
            { "name": "Azul Marinho", "hex": "#000080", "image": "images/Camisa Marcela Listra Azul 1.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Camisa feita 100% de linho, com listras e botões de madrepérola."
    },
    {
        "id": 18,
        "name": "Faixa Mahalo",
        "price": "R$ 290,00",
        "priceNum": 290,
        "image": "images/Macacao dulu 555.png",
        "images": [
            "images/Macacao dulu 555.png",
            "images/Vestido Aloha e faixa.png",
            "images/Vestido Aloha e Faixa 2.png",
            "images/Vestido Aloha e Faixa 3.png",
            "images/Vestido Mahalo e Faixa.png"
        ],
        "category": "Acessórios",
        "badge": "Novo",
        "colors": [
            { "name": "Bege", "hex": "#D5C4B3", "image": "images/Macacao dulu 555.png" }
        ],
        "sizes": ["Tamanho Único"],
        "desc": "Faixa de couro autêntico, cuidadosamente feita à mão e detalhada com argolas de metal. O acessório perfeito para marcar a silhueta com personalidade e dar um toque rústico e sofisticado ao seu visual."
    }
];

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

/* ========== MODAL ========== */
let currentModalProduct = null;
let selectedModalSize = null;
let selectedModalColor = null;

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

    const msg = encodeURIComponent(`Olá! Gostaria de comprar: ${p.name} (${p.price}).`);
    document.getElementById('modal-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleThumbnailClick(imgSrc) {
    document.getElementById('modal-img').src = imgSrc;
    
    if (currentModalProduct && currentModalProduct.colors) {
        // Find if this image is the primary image of any color
        const matchingColor = currentModalProduct.colors.find(c => c.image === imgSrc);
        if (matchingColor) {
            const dots = document.querySelectorAll('#modal-colors .color-dot');
            dots.forEach(dot => {
                if (dot.title === matchingColor.name) {
                    if (!dot.classList.contains('active')) {
                        selectedModalColor = matchingColor.name;
                        dots.forEach(d => d.classList.remove('active'));
                        dot.classList.add('active');
                    }
                }
            });
        } else {
            // Optional: If we want to map ALL images to colors, we could do a fuzzy match here
            // based on the filename, but mapping the main image covers 90% of cases.
            // E.g. if the image has "Azul" in the name, select "Azul".
            const lowercaseSrc = imgSrc.toLowerCase();
            const fuzzyColor = currentModalProduct.colors.find(c => {
                const colorKeywords = c.name.toLowerCase().split(' ').filter(w => w.length > 2);
                return colorKeywords.some(keyword => lowercaseSrc.includes(keyword));
            });
            
            if (fuzzyColor) {
                const dots = document.querySelectorAll('#modal-colors .color-dot');
                dots.forEach(dot => {
                    if (dot.title === fuzzyColor.name && !dot.classList.contains('active')) {
                        selectedModalColor = fuzzyColor.name;
                        dots.forEach(d => d.classList.remove('active'));
                        dot.classList.add('active');
                    }
                });
            }
        }
    }
}

function selectModalSize(btn, size) {
    selectedModalSize = size;
    btn.closest('.size-options').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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
