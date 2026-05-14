/**
 * SURDEASIA — Cielo API 3.0 Service
 * Handles credit card, debit card, and PIX payments
 */
const axios = require('axios');

class CieloService {
    constructor() {
        const isSandbox = process.env.CIELO_ENV !== 'production';

        this.merchantId = process.env.CIELO_MERCHANT_ID;
        this.merchantKey = process.env.CIELO_MERCHANT_KEY;

        this.apiUrl = isSandbox
            ? 'https://apisandbox.cieloecommerce.cielo.com.br'
            : 'https://api.cieloecommerce.cielo.com.br';

        this.queryUrl = isSandbox
            ? 'https://apiquerysandbox.cieloecommerce.cielo.com.br'
            : 'https://apiquery.cieloecommerce.cielo.com.br';

        this.headers = {
            'Content-Type': 'application/json',
            'MerchantId': this.merchantId,
            'MerchantKey': this.merchantKey
        };
    }

    /**
     * Credit Card Payment
     */
    async payWithCreditCard({ orderId, amount, installments, card, customer }) {
        const payload = {
            MerchantOrderId: orderId,
            Customer: {
                Name: customer.name,
                Identity: customer.cpf,
                IdentityType: 'CPF',
                Email: customer.email
            },
            Payment: {
                Type: 'CreditCard',
                Amount: amount, // in cents (e.g. R$ 100,00 = 10000)
                Installments: installments || 1,
                Capture: true, // auto-capture
                SoftDescriptor: 'SURDEASIA',
                CreditCard: {
                    CardNumber: card.number.replace(/\s/g, ''),
                    Holder: card.holder,
                    ExpirationDate: card.expiration, // MM/YYYY
                    SecurityCode: card.cvv,
                    Brand: this._detectBrand(card.number)
                }
            }
        };

        try {
            const response = await axios.post(
                `${this.apiUrl}/1/sales/`,
                payload,
                { headers: this.headers }
            );
            return {
                success: response.data.Payment.Status === 2, // 2 = PaymentConfirmed
                paymentId: response.data.Payment.PaymentId,
                status: response.data.Payment.Status,
                returnCode: response.data.Payment.ReturnCode,
                returnMessage: response.data.Payment.ReturnMessage,
                tid: response.data.Payment.Tid,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * PIX Payment
     */
    async payWithPix({ orderId, amount, customer }) {
        const payload = {
            MerchantOrderId: orderId,
            Customer: {
                Name: customer.name,
                Identity: customer.cpf,
                IdentityType: 'CPF'
            },
            Payment: {
                Type: 'Pix',
                Amount: amount, // in cents
                Provider: 'Cielo30'
            }
        };

        try {
            const response = await axios.post(
                `${this.apiUrl}/1/sales/`,
                payload,
                { headers: this.headers }
            );

            return {
                success: true,
                paymentId: response.data.Payment.PaymentId,
                qrCodeBase64: response.data.Payment.QrCodeBase64Image,
                qrCodeString: response.data.Payment.QrCodeString,
                expirationDate: response.data.Payment.ExpirationDate,
                status: response.data.Payment.Status,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Check payment status
     */
    async getPaymentStatus(paymentId) {
        try {
            const response = await axios.get(
                `${this.queryUrl}/1/sales/${paymentId}`,
                { headers: this.headers }
            );

            return {
                success: true,
                status: response.data.Payment.Status,
                statusName: this._statusName(response.data.Payment.Status),
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Detect card brand from number
     */
    _detectBrand(number) {
        const clean = number.replace(/\D/g, '');
        if (/^4/.test(clean)) return 'Visa';
        if (/^5[1-5]/.test(clean)) return 'Master';
        if (/^3[47]/.test(clean)) return 'Amex';
        if (/^(636368|438935|504175|451416|636297)/.test(clean)) return 'Elo';
        if (/^(606282|3841)/.test(clean)) return 'Hipercard';
        return 'Visa'; // default
    }

    /**
     * Map status code to name
     */
    _statusName(status) {
        const map = {
            0: 'NotFinished',
            1: 'Authorized',
            2: 'PaymentConfirmed',
            3: 'Denied',
            10: 'Voided',
            11: 'Refunded',
            12: 'Pending',
            13: 'Aborted',
            20: 'Scheduled'
        };
        return map[status] || 'Unknown';
    }
}

module.exports = CieloService;
