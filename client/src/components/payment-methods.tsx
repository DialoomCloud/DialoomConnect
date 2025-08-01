import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  Apple, 
  DollarSign,
  CheckCircle,
  Shield,
  Zap
} from "lucide-react";

interface PaymentMethodsProps {
  amount: number;
  currency?: string;
  onPaymentMethodSelect: (method: string) => void;
  hostName?: string;
  isConnectEnabled?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  processing?: string;
  fee?: string;
  bgColor: string;
  textColor: string;
}

export function PaymentMethods({
  amount,
  currency = "EUR",
  onPaymentMethodSelect,
  hostName,
  isConnectEnabled = true
}: PaymentMethodsProps) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Tarjeta de Crédito/Débito",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Visa, Mastercard, American Express",
      enabled: true,
      processing: "Inmediato",
      fee: "2.9% + €0.30",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-800 dark:text-blue-200"
    },
    {
      id: "google_pay",
      name: "Google Pay",
      icon: <Smartphone className="w-6 h-6" />,
      description: "Pago rápido con tu cuenta de Google",
      enabled: true,
      processing: "Inmediato",
      fee: "2.9% + €0.30",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      textColor: "text-green-800 dark:text-green-200"
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      icon: <Apple className="w-6 h-6" />,
      description: "Pago seguro con Touch ID o Face ID",
      enabled: true,
      processing: "Inmediato",
      fee: "2.9% + €0.30",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      textColor: "text-gray-800 dark:text-gray-200"
    },
    {
      id: "sepa_debit",
      name: "SEPA Domiciliación",
      icon: <DollarSign className="w-6 h-6" />,
      description: "Pago directo desde tu cuenta bancaria",
      enabled: true,
      processing: "3-5 días hábiles",
      fee: "0.8%",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      textColor: "text-purple-800 dark:text-purple-200"
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onPaymentMethodSelect(methodId);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateFee = (method: PaymentMethod) => {
    if (method.id === 'sepa_debit') {
      return amount * 0.008;
    }
    return amount * 0.029 + 0.30;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
          {t('payment.selectMethod')}
        </h3>
        <p className="text-gray-600">
          {t('payment.securePayment')} {hostName && `a ${hostName}`}
        </p>
        <div className="text-3xl font-bold text-[hsl(188,100%,38%)]">
          {formatAmount(amount)}
        </div>
      </div>

      {/* Stripe Connect Status */}
      {isConnectEnabled && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {t('payment.stripeConnectEnabled')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {t('payment.stripeConnectDesc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
              selectedMethod === method.id
                ? 'border-[hsl(188,100%,38%)] bg-[hsl(188,100%,98%)] dark:bg-[hsl(188,100%,5%)]'
                : 'border-gray-200 hover:border-[hsl(188,100%,60%)]'
            } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => method.enabled && handleMethodSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${method.bgColor}`}>
                    <div className={method.textColor}>
                      {method.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{method.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {method.processing}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {method.fee}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {t('payment.processingFee')}
                  </div>
                  <div className="font-semibold">
                    {formatAmount(calculateFee(method))}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    {t('payment.total')}: {formatAmount(amount + calculateFee(method))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                {t('payment.securityTitle')}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {t('payment.securityDesc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect Info */}
      {isConnectEnabled && (
        <div className="text-center text-sm text-gray-500">
          <p>
            {t('payment.poweredBy')} 
            <span className="font-semibold text-[hsl(188,100%,38%)]"> Stripe Connect</span>
          </p>
          <p className="mt-1">
            {t('payment.stripeSecure')}
          </p>
        </div>
      )}
    </div>
  );
}