import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Plus, 
  Settings, 
  Trash2, 
  Edit,
  Shield,
  Check,
  X,
  ArrowLeft
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface AddCardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  holderName: string;
}

export default function PaymentSettings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cardForm, setCardForm] = useState<AddCardFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    holderName: ''
  });

  // Query for user's payment methods
  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
    enabled: !!user,
  });

  // Add card mutation
  const addCardMutation = useMutation({
    mutationFn: async (cardData: AddCardFormData) => {
      const response = await apiRequest('/api/payment-methods', {
        method: 'POST',
        body: cardData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setShowAddCard(false);
      setCardForm({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        holderName: ''
      });
      toast({
        title: "Tarjeta agregada",
        description: "Tu método de pago ha sido agregado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar la tarjeta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Remove card mutation
  const removeCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      await apiRequest(`/api/payment-methods/${cardId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Tarjeta eliminada",
        description: "El método de pago ha sido eliminado.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarjeta.",
        variant: "destructive",
      });
    },
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    addCardMutation.mutate(cardForm);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('mastercard')) return '💳';
    if (brandLower.includes('amex')) return '💳';
    return '💳';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Debes iniciar sesión para ver tus métodos de pago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Métodos de Pago</h1>
          </div>
        </div>

        <div className="space-y-4">
          {/* Add New Card Section */}
          <Card>
            <CardContent className="p-4">
              <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-center gap-2 h-12">
                    <Plus className="w-4 h-4" />
                    Agregar Nueva Tarjeta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                      <Label htmlFor="holderName">Nombre del Titular</Label>
                      <Input
                        id="holderName"
                        value={cardForm.holderName}
                        onChange={(e) => setCardForm(prev => ({ ...prev, holderName: e.target.value }))}
                        placeholder="Nombre como aparece en la tarjeta"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input
                        id="cardNumber"
                        value={formatCardNumber(cardForm.cardNumber)}
                        onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="expiryMonth">Mes</Label>
                        <Input
                          id="expiryMonth"
                          value={cardForm.expiryMonth}
                          onChange={(e) => setCardForm(prev => ({ ...prev, expiryMonth: e.target.value }))}
                          placeholder="MM"
                          maxLength={2}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryYear">Año</Label>
                        <Input
                          id="expiryYear"
                          value={cardForm.expiryYear}
                          onChange={(e) => setCardForm(prev => ({ ...prev, expiryYear: e.target.value }))}
                          placeholder="YY"
                          maxLength={2}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          value={cardForm.cvc}
                          onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={addCardMutation.isPending}
                    >
                      {addCardMutation.isPending ? "Agregando..." : "Agregar Tarjeta"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Payment Methods List */}
          {isLoading ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              </CardContent>
            </Card>
          ) : paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No tienes métodos de pago guardados</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} className={method.isDefault ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {getBrandIcon(method.brand)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">•••• {method.last4}</span>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {method.brand.toUpperCase()} • Vence {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCardMutation.mutate(method.id)}
                      disabled={removeCardMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Cambiar Contraseña
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Actualizar Contraseña
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Stripe Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Tus datos de pago están protegidos por Stripe con encriptación de nivel bancario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}