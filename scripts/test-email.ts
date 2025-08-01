import { emailService } from "../server/email-service";

async function sendTestEmail() {
  console.log("Enviando email de prueba a nachosaladrigas@gmail.com...");
  
  try {
    const result = await emailService.sendEmail({
      templateType: 'user_registration',
      recipientEmail: 'app@dialoom.cloud',
      variables: {
        firstName: 'Usuario de Prueba',
        dashboardUrl: 'https://dialoom.cloud/dashboard'
      }
    });

    if (result) {
      console.log("✅ Email de prueba enviado exitosamente!");
      console.log("Revisa tu bandeja de entrada en nachosaladrigas@gmail.com");
    } else {
      console.log("❌ Error al enviar el email de prueba");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

sendTestEmail();