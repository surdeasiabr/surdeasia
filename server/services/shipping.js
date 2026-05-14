/**
 * SURDEASIA — Shipping Calculator (Correios)
 * Calculates PAC and SEDEX shipping costs from Barra da Tijuca
 */

// Origin CEP: Barra da Tijuca, Rio de Janeiro
const ORIGIN_CEP = process.env.ORIGIN_CEP || '22640100';

// Default package dimensions for clothing
const DEFAULT_PACKAGE = {
    weight: 0.5,       // kg per item
    length: 30,         // cm
    height: 10,         // cm
    width: 25,          // cm
    diameter: 0
};

class ShippingService {
    /**
     * Calculate shipping using Correios API
     * Services: PAC (04510) and SEDEX (04014)
     */
    async calculate(destinationCep, itemCount = 1) {
        const cleanCep = destinationCep.replace(/\D/g, '');
        
        if (cleanCep.length !== 8) {
            return { success: false, error: 'CEP inválido' };
        }

        // Adjust weight based on item count (min 0.3kg, each item ~0.4kg)
        const totalWeight = Math.max(0.3, itemCount * 0.4);
        // Adjust height slightly for more items
        const height = Math.min(DEFAULT_PACKAGE.height + (itemCount - 1) * 3, 60);

        const services = [
            { code: '04014', name: 'SEDEX' },
            { code: '04510', name: 'PAC' }
        ];

        const results = [];

        for (const service of services) {
            try {
                const params = new URLSearchParams({
                    nCdEmpresa: '',
                    sDsSenha: '',
                    nCdServico: service.code,
                    sCepOrigem: ORIGIN_CEP,
                    sCepDestino: cleanCep,
                    nVlPeso: String(totalWeight),
                    nCdFormato: '1',
                    nVlComprimento: String(DEFAULT_PACKAGE.length),
                    nVlAltura: String(height),
                    nVlLargura: String(DEFAULT_PACKAGE.width),
                    nVlDiametro: String(DEFAULT_PACKAGE.diameter),
                    sCdMaoPropria: 'N',
                    nVlValorDeclarado: '0',
                    sCdAvisoRecebimento: 'N',
                    StrRetorno: 'xml',
                    nIndicaCalculo: '3'
                });

                const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params}`;
                const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
                const xml = await response.text();

                // Parse simple XML values
                const valor = xml.match(/<Valor>([\d.,]+)<\/Valor>/)?.[1];
                const prazo = xml.match(/<PrazoEntrega>(\d+)<\/PrazoEntrega>/)?.[1];
                const erro = xml.match(/<Erro>(\d+)<\/Erro>/)?.[1];

                if (valor && erro === '0') {
                    const price = parseFloat(valor.replace('.', '').replace(',', '.'));
                    results.push({
                        service: service.name,
                        code: service.code,
                        price,
                        priceFormatted: `R$ ${valor}`,
                        days: parseInt(prazo),
                        daysText: `${prazo} dias úteis`
                    });
                }
            } catch (err) {
                console.error(`Correios ${service.name} error:`, err.message);
            }
        }

        // If Correios API fails, use fallback regional pricing
        if (results.length === 0) {
            return this.fallbackCalculation(cleanCep, itemCount);
        }

        return {
            success: true,
            options: results.sort((a, b) => a.price - b.price),
            origin: ORIGIN_CEP
        };
    }

    /**
     * Fallback: regional flat-rate pricing if Correios API is unavailable
     */
    fallbackCalculation(cep, itemCount) {
        const region = cep.substring(0, 1);
        
        // Approximate rates based on region (from RJ)
        const rates = {
            '0': { pac: 22, sedex: 35, pacDays: 8, sedexDays: 3 },   // SP
            '1': { pac: 22, sedex: 35, pacDays: 8, sedexDays: 3 },   // SP
            '2': { pac: 15, sedex: 22, pacDays: 5, sedexDays: 2 },   // RJ/ES
            '3': { pac: 20, sedex: 32, pacDays: 7, sedexDays: 3 },   // MG
            '4': { pac: 25, sedex: 40, pacDays: 9, sedexDays: 4 },   // BA/SE
            '5': { pac: 28, sedex: 45, pacDays: 10, sedexDays: 5 },  // PE/AL/PB/RN
            '6': { pac: 30, sedex: 50, pacDays: 12, sedexDays: 5 },  // CE/PI/MA/PA/AP/AM
            '7': { pac: 28, sedex: 45, pacDays: 10, sedexDays: 4 },  // DF/GO/TO/MT/MS/RO/AC/RR
            '8': { pac: 25, sedex: 38, pacDays: 8, sedexDays: 3 },   // PR/SC
            '9': { pac: 25, sedex: 38, pacDays: 8, sedexDays: 3 }    // RS
        };

        const rate = rates[region] || rates['2'];
        const multiplier = 1 + (itemCount - 1) * 0.3; // 30% more per extra item

        return {
            success: true,
            fallback: true,
            options: [
                {
                    service: 'PAC',
                    code: '04510',
                    price: Math.round(rate.pac * multiplier * 100) / 100,
                    priceFormatted: `R$ ${(rate.pac * multiplier).toFixed(2).replace('.', ',')}`,
                    days: rate.pacDays,
                    daysText: `${rate.pacDays} dias úteis`
                },
                {
                    service: 'SEDEX',
                    code: '04014',
                    price: Math.round(rate.sedex * multiplier * 100) / 100,
                    priceFormatted: `R$ ${(rate.sedex * multiplier).toFixed(2).replace('.', ',')}`,
                    days: rate.sedexDays,
                    daysText: `${rate.sedexDays} dias úteis`
                }
            ],
            origin: ORIGIN_CEP
        };
    }
}

module.exports = ShippingService;
