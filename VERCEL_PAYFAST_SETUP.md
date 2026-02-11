# Vercel Deployment & PayFast Setup Guide

This guide walks you through deploying your Alpha Appeal application to Vercel and configuring PayFast for South African payments.

## 🚀 Vercel Deployment

### 1. Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Git repository](https://github.com) with your Alpha Appeal code
- [PayFast Merchant Account](https://www.payfast.co.za/) (for production)

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy your project**
   ```bash
   cd alpha-appeal
   vercel
   ```

4. **Follow the prompts** to connect your Git repository and configure the project

#### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Environment Variables

Set these environment variables in your Vercel project settings:

#### Required Variables
```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-supabase-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

# PayFast Configuration
PAYFAST_MERCHANT_ID="your-payfast-merchant-id"
PAYFAST_MERCHANT_KEY="your-payfast-merchant-key"
PAYFAST_SANDBOX="true"  # Set to "false" for production
```

#### Optional Variables
```bash
# Debug Mode
VITE_DEBUG_MODE="true"

# Custom URLs (if different from defaults)
VITE_PAYFAST_MERCHANT_ID="your-merchant-id"
VITE_PAYFAST_MERCHANT_KEY="your-merchant-key"
```

### 4. Vercel Project Configuration

The `vercel.json` file is already configured with:
- ✅ Static build optimization
- ✅ SPA routing (catch-all for React Router)
- ✅ Security headers
- ✅ Caching strategies
- ✅ Frankfurt region for better Africa connectivity

## 💰 PayFast Integration Setup

### 1. Create PayFast Account

1. Visit [PayFast Registration](https://www.payfast.co.za/register)
2. Choose "Merchant" account type
3. Complete business verification
4. Note your Merchant ID and Merchant Key

### 2. Configure PayFast Settings

#### For Sandbox Testing
1. Use test credentials from PayFast sandbox
2. Set `PAYFAST_SANDBOX="true"` in environment variables
3. Test payments with test credit card numbers

#### For Production
1. Use your live Merchant ID and Key
2. Set `PAYFAST_SANDBOX="false"` in environment variables
3. Configure return/cancel URLs in PayFast dashboard

### 3. PayFast Dashboard Configuration

#### Webhook/Instant Payment Notification (IPN)
- **IPN URL**: `https://your-domain.com/api/payfast/webhook`
- **IPN Method**: POST
- **IPN Status**: Enabled

#### Return URLs
- **Return URL**: `https://your-domain.com/checkout/success`
- **Cancel URL**: `https://your-domain.com/checkout/cancel`
- **Notify URL**: `https://your-domain.com/api/payfast/webhook`

#### Payment Methods
Enable these payment methods in your PayFast dashboard:
- ✅ Credit Cards (Visa, MasterCard, American Express)
- ✅ Instant EFT (FNB, Standard Bank, Nedbank, ABSA)
- ✅ Mobile Payments (SnapScan, Zapper)
- ✅ PayPal

### 4. Testing PayFast Integration

#### Sandbox Testing
```bash
# Set sandbox mode
PAYFAST_SANDBOX="true"

# Test credit card numbers (from PayFast docs):
# Visa: 4000 0000 0000 0002
# MasterCard: 5000 0000 0000 0002
# Expiry: Any future date
# CVV: Any 3 digits
```

#### Production Testing
1. Set `PAYFAST_SANDBOX="false"`
2. Use real payment methods
3. Monitor webhook logs in Vercel dashboard

## 🔧 Post-Deployment Setup

### 1. Verify Deployment

Check your deployed application:
- ✅ Homepage loads correctly
- ✅ Language switcher works
- ✅ Currency displays as ZAR (R)
- ✅ Payment buttons are visible

### 2. Test Payment Flow

1. **Add items to cart**
2. **Proceed to checkout**
3. **Select payment method**
4. **Complete payment via PayFast**
5. **Verify webhook processing**

### 3. Monitor Webhooks

Check PayFast webhook status:
1. Go to PayFast Dashboard
2. Navigate to "Reports" > "IPN History"
3. Verify successful webhook deliveries
4. Check for any failed notifications

### 4. SSL and Security

Vercel automatically provides SSL certificates:
- ✅ HTTPS enforced
- ✅ SSL encryption active
- ✅ Security headers configured

## 🚨 Troubleshooting

### Common Issues

#### Payment Not Processing
- ✅ Check PayFast credentials in environment variables
- ✅ Verify webhook URL is correct
- ✅ Check PayFast dashboard IPN settings
- ✅ Review Vercel logs for errors

#### Webhook Not Receiving Notifications
- ✅ Verify webhook URL in PayFast dashboard
- ✅ Check Vercel function deployment
- ✅ Review PayFast IPN history
- ✅ Test with sandbox mode

#### Currency Display Issues
- ✅ Verify ZAR formatting in currency utilities
- ✅ Check locale settings
- ✅ Test with different browsers

### Debug Mode

Enable debug logging:
```bash
VITE_DEBUG_MODE="true"
```

This will show detailed logs in browser console and Vercel logs.

## 📊 Monitoring & Analytics

### Vercel Analytics
- Visit [Vercel Analytics](https://vercel.com/analytics) for performance metrics
- Monitor deployment status and errors
- Track visitor statistics

### PayFast Analytics
- Use PayFast dashboard for payment analytics
- Monitor successful vs failed transactions
- Track payment method preferences

## 🔄 Maintenance

### Regular Tasks
1. **Monitor webhook logs** weekly
2. **Check payment processing** daily
3. **Update dependencies** monthly
4. **Review security settings** quarterly

### Updates
- Always test changes in sandbox first
- Deploy to staging environment before production
- Monitor for any payment processing issues after updates

## 📞 Support

### PayFast Support
- [PayFast Documentation](https://developers.payfast.co.za/documentation/)
- [PayFast Support](https://www.payfast.co.za/support/)
- Phone: +27 21 447 6123

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Vercel Status](https://www.vercel-status.com/)

### Development Support
- Check browser console for JavaScript errors
- Review Vercel deployment logs
- Verify environment variable configuration

---

**🎉 Your Alpha Appeal application is now ready for production with Vercel hosting and PayFast payments!**

For any issues or questions, refer to this guide or check the project documentation.