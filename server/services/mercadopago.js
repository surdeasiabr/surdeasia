/**
 * SURDEASIA — Mercado Pago Service
 * Creates payment preferences for Checkout Pro
 * The customer is redirected to Mercado Pago's secure page to pay
 */
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

class MercadoPagoService {
    constructor() {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });
        this.preference = new Preference(this.client);
        this.payment = new Payment(this.client);
    }

    /**
     * Create a checkout preference
     * Returns a URL where the customer pays (credit, debit, PIX, boleto — all handled by MP)
     */
    async createPreference({ orderId, items, customer, siteUrl }) {
        const mpItems = items.map(item => ({
            id: String(item.id),
            title: item.name,
            description: `${item.color} · ${item.size}`,
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: 'BRL'
        }));

        const body = {
            items: mpItems,
            payer: {
                name: customer.name?.split(' ')[0] || '',
                surname: customer.name?.split(' ').slice(1).join(' ') || '',
                email: customer.email || '',
                phone: {
                    area_code: customer.phone?.slice(0, 2) || '',
                    number: customer.phone?.slice(2) || ''
                },
                identification: {
                    type: 'CPF',
                    number: customer.cpf || ''
                },
                address: {
                    zip_code: customer.address?.cep || '',
                    street_name: customer.address?.street || '',
                    street_number: parseInt(customer.address?.number) || 0
                }
            },
            external_reference: orderId,
            statement_descriptor: 'SURDEASIA',
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 6
            }
        };

        // Only add back_urls and notification_url if using a real domain (not localhost)
        const isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
        if (!isLocal) {
            body.back_urls = {
                success: `${siteUrl}/checkout-result.html?status=approved`,
                failure: `${siteUrl}/checkout-result.html?status=rejected`,
                pending: `${siteUrl}/checkout-result.html?status=pending`
            };
            body.auto_return = 'approved';
            body.notification_url = `${siteUrl}/api/webhooks/mercadopago`;
        }

        try {
            const result = await this.preference.create({ body });
            return {
                success: true,
                preferenceId: result.id,
                checkoutUrl: result.init_point,        // Production URL
                sandboxUrl: result.sandbox_init_point,  // Sandbox URL for testing
                orderId
            };
        } catch (error) {
            console.error('MP Preference Error:', error);
            return {
                success: false,
                error: error.message || 'Erro ao criar pagamento'
            };
        }
    }

    /**
     * Get payment details by ID (used in webhooks)
     */
    async getPayment(paymentId) {
        try {
            const result = await this.payment.get({ id: paymentId });
            return {
                success: true,
                status: result.status,
                externalReference: result.external_reference,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = MercadoPagoService;
