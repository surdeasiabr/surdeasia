const fs = require('fs');

const scriptPath = 'c:\\Users\\tomas\\GOOGLE ANTIGRAVITY\\surdeasia\\script.js';
let content = fs.readFileSync(scriptPath, 'utf8');

const products = [
    {
        id: 1, name: 'Macacão Dulu Linho', price: 'R$ 389,00', priceNum: 389,
        image: 'images/Macacao Dulu 1.png',
        images: ['images/Macacao Dulu 1.png', 'images/Macacao Dulu 2.png', 'images/Macacao dulu 3.png'],
        category: 'Macacões',
        badge: 'Novo',
        colors: [
            { name: 'Branco', hex: '#FFFFFF' },
            { name: 'Azul Marinho', hex: '#000080' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Macacão longo de linho, perfeito para dias ensolarados à beira-mar. Caimento solto e elegante que acompanha o movimento do corpo, acompanhado de cinto.'
    },
    {
        id: 15, name: 'Macacão Dulu Voil de Viscosa', price: 'R$ 389,00', priceNum: 389,
        image: 'images/Macacao Dulu 1.png',
        images: ['images/Macacao Dulu 1.png', 'images/Macacao Dulu 2.png', 'images/Macacao dulu 3.png'],
        category: 'Macacões',
        badge: 'Novo',
        colors: [
            { name: 'Bordô Stoneado', hex: '#800000' },
            { name: 'Azul Astoneado', hex: '#4A81B8' },
            { name: 'Verde Stoneado', hex: '#8B8C65' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Macacão longo em voil de viscosa, perfeito para dias ensolarados à beira-mar. Caimento solto e elegante que acompanha o movimento do corpo, acompanhado de cinto.'
    },
    {
        id: 2, name: 'Saia Mahalo', price: 'R$ 350,00', priceNum: 350,
        image: 'images/Saia Mahalo Verde Manzana 1.jpg',
        images: [
            'images/Saia Mahalo Verde Manzana 1.jpg', 
            'images/Saia Mahalo Verde Manzana 2].jpg',
            'images/Saia Mahalo Rosa Viejo Voil de Viscosa 1.jpg',
            'images/Saia Mahalo Rosa Viejo Voil de Viscosa 2.jpg',
            'images/photo22.jpg',
            'images/photo11.jpg'
        ],
        category: 'Saias',
        colors: [
            { name: 'Verde Maçã', hex: '#8DB600' },
            { name: 'Rosa Seco', hex: '#D6899E' },
            { name: 'Cinza', hex: '#D3D3D3' },
            { name: 'Azul Mediterrâneo', hex: '#4A81B8' },
            { name: 'Bege Argila', hex: '#D5C4B3' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Saia longa esvoaçante e elegante com cós ajustado. Perfeita para os dias de verão.'
    },
    {
        id: 3, name: 'Calca Summer', price: 'R$ 350,00', priceNum: 350,
        image: 'images/Calca Summer 1.png',
        images: ['images/Calca Summer 1.png', 'images/calca Summer 2.png', 'images/Calca Summer 3.png', 'images/Calca Summer 4.png'],
        category: 'Calças',
        colors: [
            { name: 'Branca', hex: '#FFFFFF' }
        ],
        sizes: ['P/M', 'M/G'],
        desc: 'Calça pantalona com camadas fluídas e design leve.'
    },
    {
        id: 4, name: 'Camisa Wave', price: 'R$ 340,00', priceNum: 340,
        image: 'images/Camisa Wave Branca Voil viscosa 1.jpg',
        images: [
            'images/Camisa Wave Branca Voil viscosa 1.jpg',
            'images/camisa wave 1.jpeg', 
            'images/Camisa wave 2.jpeg', 
            'images/photo8.jpg',
            'images/photo9.jpg',
            'images/photo10.jpg'
        ],
        category: 'Camisas',
        badge: 'Best Seller',
        colors: [
            { name: 'Branca', hex: '#FFFFFF' },
            { name: 'Celeste', hex: '#87CEEB' }
        ],
        sizes: ['P', 'M', 'G'],
        desc: 'Camisa elegante em voil de viscosa com babados esvoaçantes nas mangas. Possui botões de madrepérola. Às vezes é feita de linho ou de algodão.'
    },
    {
        id: 5, name: 'Chemisse Wave de Linho', price: 'R$ 420,00', priceNum: 420,
        image: 'images/Chemisse Linho Bege Listrado 1.jpeg',
        images: [
            'images/Chemisse Linho Bege Listrado 1.jpeg', 
            'images/Chemisse Linho Bege Listrado 2.jpeg', 
            'images/Chemisse Linho Bege Listrado 3.jpeg'
        ],
        category: 'Camisas',
        badge: 'Destaque',
        colors: [
            { name: 'Bege Listrado', hex: '#D5C4B3' }
        ],
        sizes: ['P', 'M', 'G'],
        desc: 'Chemisse em linho puro com babados delicados nas mangas. O fechamento é com botões de madrepérola. Uma peça linda, sofisticada e fluida para seus dias de verão.'
    },
    {
        id: 6, name: 'Camisa Marcela De Linho', price: 'R$ 380,00', priceNum: 380,
        image: 'images/Camisa Marcela Listra Verde 1 .jpg',
        images: [
            'images/Camisa Marcela Listra Verde 1 .jpg', 
            'images/Camisa Marcela Listra Verde 2.jpg',
            'images/marcela listrada azul .jpeg',
            'images/marcela listrada azul 2.jpeg',
            'images/marcela listrada azul 3.jpeg'
        ],
        category: 'Camisas',
        colors: [
            { name: 'Verde Seco', hex: '#8B8C65' },
            { name: 'Azul Marinho', hex: '#000080' }
        ],
        sizes: ['P', 'M', 'G'],
        desc: 'Camisa feita 100% de linho, com listras e botões de madrepérola.'
    },
    {
        id: 7, name: 'Chemisse Wave Voil Viscosa', price: 'R$ 380,00', priceNum: 380,
        image: 'images/Chemisse Wave Voil Viscosa 1.jpeg',
        images: [
            'images/Chemisse Wave Voil Viscosa 1.jpeg', 
            'images/Chemisse Wave Voil Viscosa 2.jpeg', 
            'images/Chemisse Wave Voil Viscosa 3.jpeg', 
            'images/Chemisse Wave Voil Viscosa 4.jpeg', 
            'images/Chemisse Wave Voil Viscosa 5.jpeg',
            'images/Chemisse wave voil de viscosa azul mediterraneo 1 .jpg',
            'images/chemisse wave voil de viscosa azul mediterraneo 2 .jpg',
            'images/photo13.jpg',
            'images/photo14.jpg'
        ],
        category: 'Camisas',
        badge: 'Novo',
        colors: [
            { name: 'Branco', hex: '#FFFFFF' },
            { name: 'Azul Mediterrâneo', hex: '#4A81B8' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Chemisse Wave em voil de viscose. Peça elegante, leve e fluida, perfeita para compor looks de verão com sofisticação.'
    },
    {
        id: 9, name: 'Chemisse Listrado Algodao', price: 'R$ 420,00', priceNum: 420,
        image: 'images/chemisse listrado algodao 1.jpeg',
        images: ['images/chemisse listrado algodao 1.jpeg', 'images/chemisse listrado algodao 2.jpeg', 'images/Chemisse Listrado Algodao 3.png'],
        category: 'Camisas',
        badge: 'Novo',
        colors: [
            { name: 'Celeste', hex: '#87CEEB' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Chemisse confeccionado em algodão premium com listras na cor celeste. Caimento impecável e frescor ideal para dias ensolarados.'
    },
    {
        id: 10, name: 'Chemisse wave Listrado Linho', price: 'R$ 420,00', priceNum: 420,
        image: 'images/Chemisse Wave Listrado Linho Azul 2.jpeg',
        images: ['images/Chemisse Wave Listrado Linho Azul 2.jpeg', 'images/Chemisse Wave Listrado Linho Azul 1.jpeg', 'images/Chemisse Wave Listrado Linho Azul 3.jpeg'],
        category: 'Camisas',
        badge: 'Novo',
        colors: [
            { name: 'Azul', hex: '#4A81B8' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Chemisse Wave em linho listrado na cor azul. Uma peça versátil e marcante que traz a essência do mar para o seu estilo.'
    },
    {
        id: 11, name: 'Vestido Saint Tropez', price: 'R$ 380,00', priceNum: 380,
        image: 'images/Saia Saint Tropez 1.jpeg',
        images: ['images/Saia Saint Tropez 1.jpeg', 'images/Saia Saint Tropez 2.jpeg', 'images/Saia Saint Tropez 3.jpeg'],
        category: 'Vestidos',
        badge: 'Novo',
        colors: [
            { name: 'Branco', hex: '#FFFFFF' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Vestido longo esvoaçante e estruturado em camadas, na cor branca. Perfeito para quem busca leveza e elegância em cada movimento.'
    },
    {
        id: 12, name: 'Vestido Aloha de Linho', price: 'R$ 385,00', priceNum: 385,
        image: 'images/Vestido Aloha Linho Branco 1.jpeg',
        images: ['images/Vestido Aloha Linho Branco 1.jpeg', 'images/Vestido Aloha Linho Branco 2.jpeg', 'images/Vestido Aloha Linho Branco 3.jpeg', 'images/Vestido Aloha Linho Branco 4.jpeg'],
        category: 'Vestidos',
        badge: 'Novo',
        colors: [
            { name: 'Branco', hex: '#FFFFFF' },
            { name: 'Azul Marinho', hex: '#000080' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Vestido confeccionado em linho premium, disponível em branco e azul marinho. Peça única que une conforto absoluto a um visual charmoso e sofisticado.'
    },
    {
        id: 13, name: 'Vestido Mahalo', price: 'R$ 380,00', priceNum: 380,
        image: 'images/blusa aloha 4.jpeg',
        images: ['images/blusa aloha 1.jpeg', 'images/blusa aloha 2.jpeg', 'images/blusa aloha 3.jpeg', 'images/blusa aloha 4.jpeg', 'images/blusa aloha 5.jpeg', 'images/blusa aloha 6.jpeg', 'images/blusa aloha 7.jpeg'],
        category: 'Vestidos',
        badge: 'Novo',
        colors: [
            { name: 'Branco', hex: '#FFFFFF' }
        ],
        sizes: ['Tamanho Único'],
        desc: 'Vestido feito de linho. Uma peça super romântica e elegante.'
    }
];

const startIdx = content.indexOf('const products = [');
const endIdx = content.indexOf('];', startIdx) + 2;

const newContent = content.slice(0, startIdx) + `const products = ${JSON.stringify(products, null, 4)};` + content.slice(endIdx);

fs.writeFileSync(scriptPath, newContent);
console.log("Updated script.js");
