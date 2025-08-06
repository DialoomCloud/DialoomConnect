import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { HelpCircle, MessageCircle, Video, Calendar, CreditCard, UserCheck, Settings, Globe, Mail, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-[hsl(188,100%,38%)] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              {t('help.title')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <p className="text-gray-600 mb-8">
              {t('help.subtitle')}
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {/* Getting Started Section */}
              <AccordionItem value="getting-started">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.gettingStarted')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.whatIsDialoom')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.whatIsDialoomAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.howToSignUp')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.howToSignUpAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* For Hosts Section */}
              <AccordionItem value="for-hosts">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.forHosts')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.setAvailability')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.setAvailabilityAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.setRates')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.setRatesAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.receivePayments')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.receivePaymentsAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* For Clients Section */}
              <AccordionItem value="for-clients">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.forClients')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.howToBook')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.howToBookAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.additionalServicesBooking')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.additionalServicesBookingAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Video Calls Section */}
              <AccordionItem value="video-calls">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.videoCalls')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.joinVideoCallDashboard')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.joinVideoCallDashboardAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.videoRequirementsUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.videoRequirementsUpdateAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Payments Section */}
              <AccordionItem value="payments">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.paymentsAndBilling')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.paymentMethodsUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.paymentMethodsUpdateAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.getInvoiceUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.getInvoiceUpdateAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Technical Issues Section */}
              <AccordionItem value="technical">
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    {t('help.technicalProblems')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.cannotAccessAccountUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.cannotAccessAccountUpdateAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t('help.videoAudioProblemsUpdate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('help.videoAudioProblemsUpdateAnswer')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                {t('help.needMoreHelp')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    <h4 className="font-semibold">
                      {t('help.emailSupportUpdate')}
                    </h4>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {t('help.emailSupportUpdateDesc')}
                  </p>
                  <a href="mailto:support@dialoom.cloud" className="text-[hsl(188,100%,38%)] hover:underline">
                    support@dialoom.cloud
                  </a>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-[hsl(188,100%,38%)]" />
                    <h4 className="font-semibold">
                      {t('help.additionalResourcesUpdate')}
                    </h4>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {t('help.additionalResourcesUpdateDesc')}
                  </p>
                  <div className="space-y-1">
                    <Link href="/legal/terms" className="text-[hsl(188,100%,38%)] hover:underline block">
                      {t('help.termsOfServiceUpdate')}
                    </Link>
                    <Link href="/legal/privacy" className="text-[hsl(188,100%,38%)] hover:underline block">
                      {t('help.privacyPolicyUpdate')}
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[hsl(188,100%,38%)] hover:underline">
            {t('help.returnHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}