/**
 * PayFast payment integration for South African payments
 * Supports EFT, credit cards, and instant EFT
 */

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string; // Order ID
  custom_str2?: string; // User ID
  custom_str3?: string; // Payment type
  payment_method?: string; // cc, eft, etc.
  signature?: string;
}

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  isSandbox: boolean;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

class PayFastService {
  private config: PayFastConfig;

  constructor(config: PayFastConfig) {
    this.config = config;
  }

  /**
   * Generate PayFast payment form data
   */
  generatePaymentData(
    amount: number,
    itemName: string,
    itemDescription: string,
    customerName: string,
    customerEmail: string,
    orderId?: string,
    userId?: string,
    paymentType?: string
  ): PayFastPaymentData {
    const amountStr = amount.toFixed(2);
    
    const paymentData: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      name_first: customerName.split(' ')[0] || customerName,
      name_last: customerName.split(' ').slice(1).join(' ') || '',
      email_address: customerEmail,
      amount: amountStr,
      item_name: itemName,
      item_description: itemDescription,
      custom_str1: orderId,
      custom_str2: userId,
      custom_str3: paymentType,
    };

    // Generate signature for security
    paymentData.signature = this.generateSignature(paymentData);

    return paymentData;
  }

  /**
   * Generate PayFast signature for payment data
   */
  private generateSignature(data: PayFastPaymentData): string {
    // Remove signature if it exists
    const dataWithoutSignature = { ...data };
    delete dataWithoutSignature.signature;

    // Sort keys alphabetically
    const sortedKeys = Object.keys(dataWithoutSignature).sort();
    
    // Build query string
    const queryString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(dataWithoutSignature[key as keyof PayFastPaymentData] || '')}`)
      .join('&');

    // Generate MD5 hash
    const crypto = require('crypto');
    return crypto.createHash('md5').update(queryString).digest('hex');
  }

  /**
   * Create payment form for frontend
   */
  createPaymentForm(paymentData: PayFastPaymentData): string {
    const formFields = Object.entries(paymentData)
      .map(([key, value]) => 
        `<input type="hidden" name="${key}" value="${value}" />`
      )
      .join('\n');

    const actionUrl = this.config.isSandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    return `
      <form id="payfast-form" action="${actionUrl}" method="post">
        ${formFields}
        <button type="submit" style="display: none;">Pay Now</button>
      </form>
      <script>
        document.getElementById('payfast-form').submit();
      </script>
    `;
  }

  /**
   * Validate PayFast notification (IPN)
   */
  validateNotification(notificationData: any): boolean {
    try {
      // Verify that the notification came from PayFast
      const signature = notificationData.signature;
      delete notificationData.signature;

      const calculatedSignature = this.generateSignature(notificationData as PayFastPaymentData);
      
      return signature === calculatedSignature;
    } catch (error) {
      console.error('PayFast notification validation failed:', error);
      return false;
    }
  }

  /**
   * Get PayFast payment URL for redirect
   */
  getPaymentUrl(paymentData: PayFastPaymentData): string {
    const actionUrl = this.config.isSandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    const queryString = Object.entries(paymentData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value || '')}`)
      .join('&');

    return `${actionUrl}?${queryString}`;
  }

  /**
   * Process membership payment
   */
  processMembershipPayment(
    planType: 'basic' | 'premium' | 'elite',
    customerName: string,
    customerEmail: string,
    orderId: string,
    userId: string
  ): PayFastPaymentData {
    const plans = {
      basic: { name: 'Basic Membership', price: 299 },
      premium: { name: 'Premium Membership', price: 599 },
      elite: { name: 'Elite Membership', price: 999 }
    };

    const plan = plans[planType];
    
    return this.generatePaymentData(
      plan.price,
      plan.name,
      `Monthly ${plan.name} subscription`,
      customerName,
      customerEmail,
      orderId,
      userId,
      'membership'
    );
  }

  /**
   * Process product order payment
   */
  processOrderPayment(
    orderTotal: number,
    customerName: string,
    customerEmail: string,
    orderId: string,
    userId: string
  ): PayFastPaymentData {
    return this.generatePaymentData(
      orderTotal,
      'Alpha Appeal Order',
      `Order #${orderId}`,
      customerName,
      customerEmail,
      orderId,
      userId,
      'order'
    );
  }
}

// Initialize PayFast service
export const payfastService = new PayFastService({
  merchantId: import.meta.env.VITE_PAYFAST_MERCHANT_ID || '',
  merchantKey: import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '',
  isSandbox: import.meta.env.VITE_PAYFAST_SANDBOX === 'true',
  returnUrl: `${window.location.origin}/checkout/success`,
  cancelUrl: `${window.location.origin}/checkout/cancel`,
  notifyUrl: `${window.location.origin}/api/payfast/webhook`
});

// Export types for use in components
export default PayFastService;
