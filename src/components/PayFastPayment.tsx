import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { payfastService, type PayFastPaymentData } from '@/lib/payfast';
import { useTranslation } from 'react-i18next';
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';

interface PayFastPaymentProps {
  amount: number;
  itemName: string;
  itemDescription: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  userId?: string;
  paymentType?: string;
  onSuccess?: (paymentData: PayFastPaymentData) => void;
  onError?: (error: string) => void;
}

const PayFastPayment = ({
  amount,
  itemName,
  itemDescription,
  customerName,
  customerEmail,
  orderId,
  userId,
  paymentType = 'order',
  onSuccess,
  onError,
}: PayFastPaymentProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PayFastPaymentData | null>(null);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Generate PayFast payment data
      const payfastData = payfastService.generatePaymentData(
        amount,
        itemName,
        itemDescription,
        customerName,
        customerEmail,
        orderId,
        userId,
        paymentType
      );

      setPaymentData(payfastData);

      // Create and submit payment form
      const paymentForm = payfastService.createPaymentForm(payfastData);
      
      // Create a temporary container for the form
      const container = document.createElement('div');
      container.innerHTML = paymentForm;
      document.body.appendChild(container);

      // Trigger form submission
      const form = container.querySelector('form');
      if (form) {
        form.submit();
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(container);
      }, 1000);

      // Notify success
      if (onSuccess) {
        onSuccess(payfastData);
      }

      toast({
        title: t('success.paymentSuccess'),
        description: t('success.orderSuccess'),
      });

    } catch (error) {
      console.error('Payment error:', error);
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Payment failed');
      }

      toast({
        title: t('errors.genericError'),
        description: t('errors.networkError'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMembershipPayment = (planType: 'basic' | 'premium' | 'elite') => {
    try {
      setIsProcessing(true);

      const payfastData = payfastService.processMembershipPayment(
        planType,
        customerName,
        customerEmail,
        orderId || `MEM-${Date.now()}`,
        userId || ''
      );

      setPaymentData(payfastData);

      // Create and submit payment form
      const paymentForm = payfastService.createPaymentForm(payfastData);
      
      const container = document.createElement('div');
      container.innerHTML = paymentForm;
      document.body.appendChild(container);

      const form = container.querySelector('form');
      if (form) {
        form.submit();
      }

      setTimeout(() => {
        document.body.removeChild(container);
      }, 1000);

      if (onSuccess) {
        onSuccess(payfastData);
      }

      toast({
        title: t('success.paymentSuccess'),
        description: t('success.orderSuccess'),
      });

    } catch (error) {
      console.error('Membership payment error:', error);
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Payment failed');
      }

      toast({
        title: t('errors.genericError'),
        description: t('errors.networkError'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">{t('checkout.paymentMethod')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('checkout.paymentDescription')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Credit Card */}
          <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-medium">{t('checkout.creditCard')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Visa, MasterCard, American Express
            </p>
          </div>

          {/* EFT */}
          <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Banknote className="w-5 h-5 text-primary" />
              <span className="font-medium">{t('checkout.eft')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Instant EFT via major banks
            </p>
          </div>

          {/* Mobile Payments */}
          <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="font-medium">{t('checkout.mobilePayments')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              SnapScan, Zapper, PayPal
            </p>
          </div>
        </div>
      </div>

      {/* Payment Amount Summary */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">{t('checkout.items')}</span>
          <span className="font-medium">{itemName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">{t('checkout.subtotal')}</span>
          <span className="font-medium">{new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
          }).format(amount)}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-2">
          <span className="font-semibold">{t('checkout.total')}</span>
          <span className="text-lg font-bold">{new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
          }).format(amount)}</span>
        </div>
      </div>

      {/* Payment Button */}
      <div className="flex gap-4">
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 bg-primary hover:bg-primary/90 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('checkout.processing')}
            </>
          ) : (
            <>
              {t('checkout.placeOrder')}
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground text-center">
        <p>{t('checkout.securityNotice')}</p>
        <p className="mt-1">{t('checkout.sslEncrypted')}</p>
      </div>
    </div>
  );
};

export default PayFastPayment;