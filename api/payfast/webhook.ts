/**
 * PayFast Webhook Handler for Vercel Serverless Functions
 * Handles Instant Payment Notifications (IPN) from PayFast
 */

import crypto from 'crypto';

interface PayFastNotification {
  m_payment_id: string;
  payment_status: 'COMPLETE' | 'FAILED' | 'PENDING';
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  name_first: string;
  name_last: string;
  email_address: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string; // Order ID
  custom_str2?: string; // User ID
  custom_str3?: string; // Payment type
  signature?: string;
}

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  isSandbox: boolean;
}

const payfastConfig: PayFastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  isSandbox: process.env.PAYFAST_SANDBOX === 'true',
};

/**
 * Validate PayFast notification signature
 */
function validatePayFastSignature(notification: PayFastNotification): boolean {
  if (!notification.signature) {
    return false;
  }

  // Create a copy without the signature
  const notificationWithoutSignature = { ...notification };
  delete notificationWithoutSignature.signature;

  // Sort keys alphabetically
  const sortedKeys = Object.keys(notificationWithoutSignature).sort();
  
  // Build query string
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(notificationWithoutSignature[key as keyof PayFastNotification] || '')}`)
    .join('&');

  // Generate MD5 hash
  const calculatedSignature = crypto.createHash('md5').update(queryString).digest('hex');
  
  return notification.signature === calculatedSignature;
}

/**
 * Verify notification came from PayFast
 */
async function verifyPayFastNotification(notification: PayFastNotification): Promise<boolean> {
  try {
    // First validate our own signature
    if (!validatePayFastSignature(notification)) {
      console.error('Invalid PayFast signature');
      return false;
    }

    // Verify the notification came from PayFast by sending it back
    const payfastUrl = payfastConfig.isSandbox 
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate';

    const response = await fetch(payfastUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PayFast NodeJS Integration',
      },
      body: new URLSearchParams(notification as any).toString(),
    });

    const result = await response.text();
    
    if (result.trim() !== 'VALID') {
      console.error('PayFast validation failed:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying PayFast notification:', error);
    return false;
  }
}

/**
 * Process successful payment
 */
async function processSuccessfulPayment(notification: PayFastNotification) {
  const orderId = notification.custom_str1;
  const userId = notification.custom_str2;
  const paymentType = notification.custom_str3;
  const amount = parseFloat(notification.amount_net);
  const customerName = `${notification.name_first} ${notification.name_last}`.trim();
  const customerEmail = notification.email_address;

  try {
    // Here you would typically:
    // 1. Update order status in your database
    // 2. Send confirmation email to customer
    // 3. Activate membership if applicable
    // 4. Update inventory if applicable

    console.log('Processing successful payment:', {
      orderId,
      userId,
      paymentType,
      amount,
      customerName,
      customerEmail,
      itemName: notification.item_name,
    });

    // Example database update (you would replace this with your actual database logic)
    // await supabase.from('orders').update({
    //   status: 'paid',
    //   payment_date: new Date().toISOString(),
    //   payment_method: 'payfast',
    // }).eq('id', orderId);

    return true;
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return false;
  }
}

/**
 * Process failed payment
 */
async function processFailedPayment(notification: PayFastNotification) {
  const orderId = notification.custom_str1;
  const userId = notification.custom_str2;
  const paymentType = notification.custom_str3;

  try {
    // Here you would typically:
    // 1. Mark order as failed
    // 2. Notify customer of failure
    // 3. Handle retry logic if applicable

    console.log('Processing failed payment:', {
      orderId,
      userId,
      paymentType,
      reason: notification.item_description,
    });

    return true;
  } catch (error) {
    console.error('Error processing failed payment:', error);
    return false;
  }
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse PayFast notification
    const notification: PayFastNotification = req.body;

    // Validate notification
    if (!await verifyPayFastNotification(notification)) {
      console.error('Invalid PayFast notification');
      return res.status(400).json({ error: 'Invalid notification' });
    }

    // Process payment based on status
    switch (notification.payment_status) {
      case 'COMPLETE':
        await processSuccessfulPayment(notification);
        break;
      
      case 'FAILED':
        await processFailedPayment(notification);
        break;
      
      case 'PENDING':
        // Handle pending payments (e.g., EFT payments)
        console.log('Payment pending:', notification);
        break;
      
      default:
        console.warn('Unknown payment status:', notification.payment_status);
    }

    // Return success to PayFast
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing PayFast webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export for TypeScript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};