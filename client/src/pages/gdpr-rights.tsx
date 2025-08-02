import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, Trash2, UserX, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function GdprRights() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [restrictionDetails, setRestrictionDetails] = useState('');
  const [restrictionType, setRestrictionType] = useState('data_processing');

  // Get privacy preferences
  const { data: privacyPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['/api/gdpr/privacy-preferences'],
    enabled: isAuthenticated,
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gdpr/export', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to export data');
      
      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `dialoom-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: i18n.language === 'es' ? 'Datos exportados' : i18n.language === 'ca' ? 'Dades exportades' : 'Data exported',
        description: i18n.language === 'es' ? 'Tus datos se han descargado exitosamente' : i18n.language === 'ca' ? 'Les teves dades s\'han descarregat amb èxit' : 'Your data has been downloaded successfully',
      });
    },
    onError: () => {
      toast({
        title: i18n.language === 'es' ? 'Error' : 'Error',
        description: i18n.language === 'es' ? 'No se pudieron exportar los datos' : i18n.language === 'ca' ? 'No s\'han pogut exportar les dades' : 'Could not export data',
        variant: 'destructive',
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/gdpr/request-deletion', {
        method: 'POST',
        body: JSON.stringify({ confirmDeletion: true }),
      });
    },
    onSuccess: () => {
      toast({
        title: i18n.language === 'es' ? 'Solicitud enviada' : i18n.language === 'ca' ? 'Sol·licitud enviada' : 'Request submitted',
        description: i18n.language === 'es' ? 'Tu cuenta será eliminada en 30 días' : i18n.language === 'ca' ? 'El teu compte serà eliminat en 30 dies' : 'Your account will be deleted in 30 days',
      });
      setShowDeleteDialog(false);
      setDeleteConfirmed(false);
    },
    onError: () => {
      toast({
        title: i18n.language === 'es' ? 'Error' : 'Error',
        description: i18n.language === 'es' ? 'No se pudo procesar la solicitud' : i18n.language === 'ca' ? 'No s\'ha pogut processar la sol·licitud' : 'Could not process request',
        variant: 'destructive',
      });
    },
  });

  // Update privacy preferences mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (prefs: any) => {
      return apiRequest('/api/gdpr/privacy-preferences', {
        method: 'POST',
        body: JSON.stringify(prefs),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gdpr/privacy-preferences'] });
      toast({
        title: i18n.language === 'es' ? 'Preferencias actualizadas' : i18n.language === 'ca' ? 'Preferències actualitzades' : 'Preferences updated',
        description: i18n.language === 'es' ? 'Tus preferencias de privacidad han sido guardadas' : i18n.language === 'ca' ? 'Les teves preferències de privacitat s\'han desat' : 'Your privacy preferences have been saved',
      });
    },
  });

  // Submit restriction request mutation
  const restrictionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/gdpr/restriction-request', {
        method: 'POST',
        body: JSON.stringify({ 
          requestType: restrictionType,
          details: restrictionDetails 
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: i18n.language === 'es' ? 'Solicitud enviada' : i18n.language === 'ca' ? 'Sol·licitud enviada' : 'Request submitted',
        description: i18n.language === 'es' ? 'Revisaremos tu solicitud en 48 horas' : i18n.language === 'ca' ? 'Revisarem la teva sol·licitud en 48 hores' : 'We will review your request within 48 hours',
      });
      setShowRestrictionDialog(false);
      setRestrictionDetails('');
    },
  });

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)] mb-8">
          {i18n.language === 'es' 
            ? 'Tus Derechos RGPD'
            : i18n.language === 'ca'
            ? 'Els teus Drets RGPD'
            : 'Your GDPR Rights'}
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {i18n.language === 'es' 
                ? 'Información General'
                : i18n.language === 'ca'
                ? 'Informació General'
                : 'General Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {i18n.language === 'es' 
                ? 'El Reglamento General de Protección de Datos (RGPD) te otorga derechos específicos sobre tus datos personales. En Dialoom, facilitamos el ejercicio de estos derechos.'
                : i18n.language === 'ca'
                ? 'El Reglament General de Protecció de Dades (RGPD) t\'atorga drets específics sobre les teves dades personals. A Dialoom, facilitem l\'exercici d\'aquests drets.'
                : 'The General Data Protection Regulation (GDPR) grants you specific rights over your personal data. At Dialoom, we facilitate the exercise of these rights.'}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                {i18n.language === 'es' 
                  ? 'Derecho de Acceso'
                  : i18n.language === 'ca'
                  ? 'Dret d\'Accés'
                  : 'Right of Access'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes solicitar una copia de todos los datos personales que tenemos sobre ti.'
                  : i18n.language === 'ca'
                  ? 'Pots sol·licitar una còpia de totes les dades personals que tenim sobre tu.'
                  : 'You can request a copy of all personal data we have about you.'}
              </p>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={!isAuthenticated || exportDataMutation.isPending}
                onClick={() => exportDataMutation.mutate()}
              >
                <Download className="w-4 h-4 mr-2" />
                {exportDataMutation.isPending 
                  ? (i18n.language === 'es' ? 'Descargando...' : i18n.language === 'ca' ? 'Descarregant...' : 'Downloading...')
                  : (i18n.language === 'es' ? 'Descargar mis Datos' : i18n.language === 'ca' ? 'Descarregar les meves Dades' : 'Download my Data')
                }
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-2">
                  {i18n.language === 'es' 
                    ? 'Debes iniciar sesión para solicitar tus datos'
                    : i18n.language === 'ca'
                    ? 'Has d\'iniciar sessió per sol·licitar les teves dades'
                    : 'You must log in to request your data'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                {i18n.language === 'es' 
                  ? 'Derecho de Rectificación'
                  : i18n.language === 'ca'
                  ? 'Dret de Rectificació'
                  : 'Right to Rectification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes actualizar o corregir cualquier información incorrecta desde tu perfil.'
                  : i18n.language === 'ca'
                  ? 'Pots actualitzar o corregir qualsevol informació incorrecta des del teu perfil.'
                  : 'You can update or correct any incorrect information from your profile.'}
              </p>
              <Link href="/profile">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  disabled={!isAuthenticated}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {i18n.language === 'es' 
                    ? 'Ir a mi Perfil'
                    : i18n.language === 'ca'
                    ? 'Anar al meu Perfil'
                    : 'Go to my Profile'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                {i18n.language === 'es' 
                  ? 'Derecho al Olvido'
                  : i18n.language === 'ca'
                  ? 'Dret a l\'Oblit'
                  : 'Right to Erasure'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes solicitar la eliminación completa de tu cuenta y todos tus datos.'
                  : i18n.language === 'ca'
                  ? 'Pots sol·licitar l\'eliminació completa del teu compte i totes les teves dades.'
                  : 'You can request the complete deletion of your account and all your data.'}
              </p>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    disabled={!isAuthenticated}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {i18n.language === 'es' 
                      ? 'Eliminar mi Cuenta'
                      : i18n.language === 'ca'
                      ? 'Eliminar el meu Compte'
                      : 'Delete my Account'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {i18n.language === 'es' 
                        ? 'Confirmar Eliminación de Cuenta'
                        : i18n.language === 'ca'
                        ? 'Confirmar Eliminació del Compte'
                        : 'Confirm Account Deletion'}
                    </DialogTitle>
                    <DialogDescription>
                      {i18n.language === 'es' 
                        ? 'Esta acción programará la eliminación completa de tu cuenta y todos tus datos en 30 días. Puedes cancelar esta solicitud contactando con soporte antes de esa fecha.'
                        : i18n.language === 'ca'
                        ? 'Aquesta acció programarà l\'eliminació completa del teu compte i totes les teves dades en 30 dies. Pots cancel·lar aquesta sol·licitud contactant amb el suport abans d\'aquesta data.'
                        : 'This action will schedule the complete deletion of your account and all your data in 30 days. You can cancel this request by contacting support before that date.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="delete-confirm" 
                        checked={deleteConfirmed}
                        onCheckedChange={setDeleteConfirmed}
                      />
                      <Label htmlFor="delete-confirm" className="text-sm">
                        {i18n.language === 'es' 
                          ? 'Entiendo que esta acción es irreversible'
                          : i18n.language === 'ca'
                          ? 'Entenc que aquesta acció és irreversible'
                          : 'I understand that this action is irreversible'}
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      {i18n.language === 'es' ? 'Cancelar' : i18n.language === 'ca' ? 'Cancel·lar' : 'Cancel'}
                    </Button>
                    <Button 
                      variant="destructive"
                      disabled={!deleteConfirmed || deleteAccountMutation.isPending}
                      onClick={() => deleteAccountMutation.mutate()}
                    >
                      {deleteAccountMutation.isPending 
                        ? (i18n.language === 'es' ? 'Procesando...' : i18n.language === 'ca' ? 'Processant...' : 'Processing...')
                        : (i18n.language === 'es' ? 'Eliminar Cuenta' : i18n.language === 'ca' ? 'Eliminar Compte' : 'Delete Account')
                      }
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <p className="text-xs text-red-600 mt-2">
                {i18n.language === 'es' 
                  ? '⚠️ Esta acción es irreversible'
                  : i18n.language === 'ca'
                  ? '⚠️ Aquesta acció és irreversible'
                  : '⚠️ This action is irreversible'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-orange-600" />
                {i18n.language === 'es' 
                  ? 'Derecho de Oposición'
                  : i18n.language === 'ca'
                  ? 'Dret d\'Oposició'
                  : 'Right to Object'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes oponerte a ciertos tipos de procesamiento de tus datos, como marketing directo.'
                  : i18n.language === 'ca'
                  ? 'Pots oposar-te a certs tipus de processament de les teves dades, com el màrqueting directe.'
                  : 'You can object to certain types of processing of your data, such as direct marketing.'}
              </p>
              <div className="space-y-3">
                {privacyPrefs && !prefsLoading && (
                  <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {i18n.language === 'es' ? 'Emails de marketing' : i18n.language === 'ca' ? 'Emails de màrqueting' : 'Marketing emails'}
                      </Label>
                      <Checkbox 
                        checked={privacyPrefs.marketingEmails}
                        onCheckedChange={(checked) => updatePrivacyMutation.mutate({ 
                          ...privacyPrefs, 
                          marketingEmails: checked 
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {i18n.language === 'es' ? 'Perfil público' : i18n.language === 'ca' ? 'Perfil públic' : 'Public profile'}
                      </Label>
                      <Checkbox 
                        checked={privacyPrefs.profileVisibility}
                        onCheckedChange={(checked) => updatePrivacyMutation.mutate({ 
                          ...privacyPrefs, 
                          profileVisibility: checked 
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {i18n.language === 'es' ? 'Consentimiento de datos' : i18n.language === 'ca' ? 'Consentiment de dades' : 'Data processing consent'}
                      </Label>
                      <Checkbox 
                        checked={privacyPrefs.dataProcessingConsent}
                        onCheckedChange={(checked) => updatePrivacyMutation.mutate({ 
                          ...privacyPrefs, 
                          dataProcessingConsent: checked 
                        })}
                      />
                    </div>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  disabled={!isAuthenticated || prefsLoading}
                  onClick={() => window.location.reload()}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  {prefsLoading 
                    ? (i18n.language === 'es' ? 'Cargando...' : i18n.language === 'ca' ? 'Carregant...' : 'Loading...')
                    : (i18n.language === 'es' ? 'Actualizar Preferencias' : i18n.language === 'ca' ? 'Actualitzar Preferències' : 'Refresh Preferences')
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                {i18n.language === 'es' 
                  ? 'Derecho a la Limitación'
                  : i18n.language === 'ca'
                  ? 'Dret a la Limitació'
                  : 'Right to Restriction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {i18n.language === 'es' 
                  ? 'Puedes solicitar que limitemos el procesamiento de tus datos en ciertas circunstancias.'
                  : i18n.language === 'ca'
                  ? 'Pots sol·licitar que limitem el processament de les teves dades en certes circumstàncies.'
                  : 'You can request that we limit the processing of your data in certain circumstances.'}
              </p>
              <Dialog open={showRestrictionDialog} onOpenChange={setShowRestrictionDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    disabled={!isAuthenticated}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {i18n.language === 'es' 
                      ? 'Solicitar Restricción'
                      : i18n.language === 'ca'
                      ? 'Sol·licitar Restricció'
                      : 'Request Restriction'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {i18n.language === 'es' 
                        ? 'Solicitar Restricción de Procesamiento'
                        : i18n.language === 'ca'
                        ? 'Sol·licitar Restricció de Processament'
                        : 'Request Processing Restriction'}
                    </DialogTitle>
                    <DialogDescription>
                      {i18n.language === 'es' 
                        ? 'Puedes solicitar que limitemos el procesamiento de tus datos en ciertas circunstancias según el Artículo 18 del RGPD.'
                        : i18n.language === 'ca'
                        ? 'Pots sol·licitar que limitem el processament de les teves dades en certes circumstàncies segons l\'Article 18 del RGPD.'
                        : 'You can request that we limit the processing of your data in certain circumstances under GDPR Article 18.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        {i18n.language === 'es' ? 'Detalles de la solicitud:' : i18n.language === 'ca' ? 'Detalls de la sol·licitud:' : 'Request details:'}
                      </Label>
                      <Textarea 
                        placeholder={i18n.language === 'es' 
                          ? 'Describe el motivo de tu solicitud de restricción...'
                          : i18n.language === 'ca'
                          ? 'Descriu el motiu de la teva sol·licitud de restricció...'
                          : 'Describe the reason for your restriction request...'
                        }
                        value={restrictionDetails}
                        onChange={(e) => setRestrictionDetails(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRestrictionDialog(false)}>
                      {i18n.language === 'es' ? 'Cancelar' : i18n.language === 'ca' ? 'Cancel·lar' : 'Cancel'}
                    </Button>
                    <Button 
                      disabled={!restrictionDetails.trim() || restrictionMutation.isPending}
                      onClick={() => restrictionMutation.mutate()}
                    >
                      {restrictionMutation.isPending 
                        ? (i18n.language === 'es' ? 'Enviando...' : i18n.language === 'ca' ? 'Enviant...' : 'Submitting...')
                        : (i18n.language === 'es' ? 'Enviar Solicitud' : i18n.language === 'ca' ? 'Enviar Sol·licitud' : 'Submit Request')
                      }
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 text-center">
              {i18n.language === 'es' 
                ? 'Para ejercer cualquiera de estos derechos o si tienes preguntas, contacta con:'
                : i18n.language === 'ca'
                ? 'Per exercir qualsevol d\'aquests drets o si tens preguntes, contacta amb:'
                : 'To exercise any of these rights or if you have questions, contact:'}
            </p>
            <p className="text-center font-medium mt-2">privacy@dialoom.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}