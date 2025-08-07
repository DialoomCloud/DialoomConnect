import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // You can add analytics tracking here
    console.log('Booking completed successfully');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-[hsl(17,12%,6%)]">
              ¡Reserva Confirmada!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Tu videollamada ha sido reservada exitosamente. Recibirás un correo electrónico con los detalles de la sesión y el enlace para unirte.
            </p>

            <div className="bg-[hsl(220,9%,98%)] rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-[hsl(17,12%,6%)] mb-2">Próximos pasos:</h4>
              <div className="flex items-start gap-3 text-sm text-left">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Recibirás un correo de confirmación con todos los detalles</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-left">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Te enviaremos un recordatorio 24 horas antes de la sesión</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-left">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>El enlace de la videollamada estará disponible 15 minutos antes</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/hosts')}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Buscar más hosts
              </Button>
              <Button
                onClick={() => setLocation('/')}
                className="flex-1 bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)]"
              >
                Ir al inicio
              </Button>
            </div>

            <p className="text-xs text-gray-500 pt-2">
              Si tienes alguna pregunta, puedes contactarnos en soporte@dialoom.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}