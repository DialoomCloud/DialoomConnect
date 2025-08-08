import { Resend } from 'resend';
import { storage } from './storage';
import { 
  EmailTemplate, 
  EmailNotification, 
  InsertEmailNotification,
  emailTemplateTypeEnum
} from '@shared/schema';

// Use the Resend API key provided by the user
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_J1kjyvgF_EvCgVLwrMXx364p3m2ryg6QX';

const resend = new Resend(RESEND_API_KEY);

export interface EmailVariables {
  [key: string]: string | number | boolean;
}

export interface SendEmailParams {
  recipientEmail: string;
  templateType: string;
  variables?: EmailVariables;
  userId?: string;
  customTemplate?: {
    subject: string;
    htmlContent: string;
    textContent?: string;
  };
}

class EmailService {
  /**
   * Send an email using a template or custom content
   */
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      let template: EmailTemplate | null = null;
      let subject: string;
      let htmlContent: string;
      let textContent: string | undefined;

      if (params.customTemplate) {
        // Use custom template provided
        subject = params.customTemplate.subject;
        htmlContent = params.customTemplate.htmlContent;
        textContent = params.customTemplate.textContent;
      } else {
        // Get template from database
        template = await storage.getEmailTemplate(params.templateType);
        if (!template || !template.isActive) {
          console.error(`Email template not found or inactive: ${params.templateType}`);
          return false;
        }

        subject = template.subject;
        htmlContent = template.htmlContent;
        textContent = template.textContent || undefined;
      }

      // Get theme colors from admin config
      const adminConfig = await storage.getAdminConfig();
      const themeColors = adminConfig.find(config => config.key === 'theme_colors');
      const primaryColor = themeColors?.value?.primary || '#008B9A';

      // Add theme variables automatically
      const themeVariables = {
        primaryColor,
        logoUrl: 'https://dialoom.replit.app/uploads/images/dialoomblue.png',
        ...params.variables
      };

      // Replace variables in content
      subject = this.replaceVariables(subject, themeVariables);
      htmlContent = this.replaceVariables(htmlContent, themeVariables);
      if (textContent) {
        textContent = this.replaceVariables(textContent, themeVariables);
      }

      // Log the email notification
      const notificationData: InsertEmailNotification = {
        userId: params.userId,
        recipientEmail: params.recipientEmail,
        templateId: template?.id,
        templateType: params.templateType as any,
        subject,
        status: 'pending',
        variables: params.variables || null,
      };

      const notification = await storage.createEmailNotification(notificationData);

      // Send email via Resend
      const emailResult = await resend.emails.send({
        from: 'Dialoom <api@dialoom.com>',
        to: params.recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
      });
      
      console.log('Resend API response:', emailResult);

      // Update notification status
      await storage.updateEmailNotification(notification.id, {
        status: 'sent',
        sentAt: new Date(),
      });

      console.log(`Email sent successfully to ${params.recipientEmail}`);
      return true;

    } catch (error: any) {
      console.error('Email sending error:', error);
      
      // Log the error if we have a notification ID
      if (params.userId || params.recipientEmail) {
        const notificationData: InsertEmailNotification = {
          userId: params.userId,
          recipientEmail: params.recipientEmail,
          templateId: null,
          templateType: params.templateType as any,
          subject: params.customTemplate?.subject || 'Email Error',
          status: 'failed',
          errorMessage: error.message,
          variables: params.variables || null,
        };
        
        await storage.createEmailNotification(notificationData);
      }
      
      return false;
    }
  }

  /**
   * Replace variables in template content
   */
  private replaceVariables(content: string, variables: EmailVariables): string {
    let result = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });
    
    return result;
  }

  /**
   * Send user registration welcome email
   */
  async sendRegistrationEmail(userEmail: string, userName: string, userId?: string): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'user_registration',
      userId,
      variables: {
        firstName: userName,
        dashboardUrl: `${process.env.APP_URL || 'https://dialoom.cloud'}/dashboard`,
      }
    });
  }

  /**
   * Send password change notification email
   */
  async sendPasswordChangeEmail(userEmail: string, userName: string, userId?: string): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'password_change',
      userId,
      variables: {
        user_name: userName,
        user_email: userEmail,
        platform_name: 'Dialoom',
        change_date: new Date().toLocaleDateString('es-ES'),
        support_email: 'support@dialoom.cloud',
      }
    });
  }

  /**
   * Send account deletion notification email
   */
  async sendAccountDeletionEmail(userEmail: string, userName: string, userId?: string): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'account_deletion',
      userId,
      variables: {
        user_name: userName,
        user_email: userEmail,
        platform_name: 'Dialoom',
        deletion_date: new Date().toLocaleDateString('es-ES'),
        support_email: 'support@dialoom.cloud',
      }
    });
  }

  /**
   * Send account deactivation notification email
   */
  async sendAccountDeactivationEmail(userEmail: string, userName: string, userId?: string): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'account_deactivation',
      userId,
      variables: {
        user_name: userName,
        user_email: userEmail,
        platform_name: 'Dialoom',
        deactivation_date: new Date().toLocaleDateString('es-ES'),
        reactivation_url: `${process.env.APP_URL || 'https://dialoom.cloud'}/auth`,
      }
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail: string, resetLink: string, userId?: string): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'password_reset',
      userId,
      variables: {
        reset_link: resetLink,
      },
      customTemplate: {
        subject: 'Restablecer contraseña - Dialoom',
        htmlContent: `
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Este enlace expirará en 1 hora.</p>
        `,
        textContent: `Hola,\nHas solicitado restablecer tu contraseña. Visita el siguiente enlace para continuar: ${resetLink}\nEste enlace expirará en 1 hora.`,
      }
    });
  }

  /**
   * Send booking created email (to the person who made the booking)
   */
  async sendBookingCreatedEmail(
    userEmail: string, 
    userName: string, 
    hostName: string, 
    bookingDate: string,
    bookingTime: string,
    meetingUrl?: string,
    userId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'booking_created',
      userId,
      variables: {
        user_name: userName,
        host_name: hostName,
        booking_date: bookingDate,
        booking_time: bookingTime,
        meeting_url: meetingUrl || 'Se proporcionará antes de la llamada',
        platform_name: 'Dialoom',
      }
    });
  }

  /**
   * Send booking received email (to the host who received the booking)
   */
  async sendBookingReceivedEmail(
    hostEmail: string, 
    hostName: string, 
    clientName: string, 
    clientEmail: string,
    bookingDate: string,
    bookingTime: string,
    amount: number,
    hostId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: hostEmail,
      templateType: 'booking_received',
      userId: hostId,
      variables: {
        host_name: hostName,
        client_name: clientName,
        client_email: clientEmail,
        booking_date: bookingDate,
        booking_time: bookingTime,
        amount: `€${amount}`,
        platform_name: 'Dialoom',
        dashboard_url: `${process.env.APP_URL || 'https://dialoom.cloud'}/dashboard`,
      }
    });
  }

  /**
   * Send user message notification email
   */
  async sendUserMessageEmail(
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    senderEmail: string,
    subject: string,
    messageContent: string,
    recipientId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail,
      templateType: 'user_message',
      userId: recipientId,
      variables: {
        recipient_name: recipientName,
        sender_name: senderName,
        sender_email: senderEmail,
        message_subject: subject,
        message_content: messageContent,
        platform_name: 'Dialoom',
        profile_url: `${process.env.APP_URL || 'https://dialoom.cloud'}/profile`,
      }
    });
  }

  /**
   * Send host activation email with verification link
   */
  async sendHostActivationEmail(
    toEmail: string,
    firstName: string,
    token: string,
    userId: string
  ): Promise<boolean> {
    const activationLink = `${process.env.REPLIT_DOMAINS || 'https://dialoom.cloud'}/api/host/activate/${token}?userId=${encodeURIComponent(userId)}`;

    return this.sendEmail({
      recipientEmail: toEmail,
      templateType: 'user_message',
      userId,
      customTemplate: {
        subject: 'Activa tu cuenta de Host en Dialoom',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">¡Hola ${firstName}!</h2>

        <p>Has solicitado convertirte en Host en Dialoom. Para activar tu cuenta y continuar con el proceso de verificación, haz clic en el siguiente enlace:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Activar mi cuenta de Host
          </a>
        </div>

        <p><strong>Este enlace expirará en 24 horas.</strong></p>

        <p>Una vez activada tu cuenta, podrás subir los documentos necesarios para verificar tu identidad y comenzar a ofrecer tus servicios en Dialoom.</p>

        <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="color: #666; font-size: 14px;">
          Saludos,<br>
          El equipo de Dialoom
        </p>

        <p style="color: #999; font-size: 12px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
          ${activationLink}
        </p>
      </div>
        `,
        textContent: `
      ¡Hola ${firstName}!

      Has solicitado convertirte en Host en Dialoom. Para activar tu cuenta y continuar con el proceso de verificación, visita el siguiente enlace:

      ${activationLink}

      Este enlace expirará en 24 horas.

      Una vez activada tu cuenta, podrás subir los documentos necesarios para verificar tu identidad y comenzar a ofrecer tus servicios en Dialoom.

      Si no solicitaste esta verificación, puedes ignorar este correo.

      Saludos,
      El equipo de Dialoom
        `
      }
    });
  }

  /**
   * Send host approval confirmation email
   */
  async sendHostApprovalEmail(
    toEmail: string,
    firstName: string,
    userId?: string
  ): Promise<boolean> {
    const dashboardLink = 'https://dialoom.cloud/dashboard';

    return this.sendEmail({
      recipientEmail: toEmail,
      templateType: 'user_message',
      userId,
      customTemplate: {
        subject: '¡Felicidades! Tu cuenta de Host ha sido verificada',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">¡Felicidades ${firstName}!</h2>

        <p>Tu cuenta de Host en Dialoom ha sido <strong>verificada exitosamente</strong>.</p>

        <p>Ahora puedes:</p>
        <ul>
          <li>Completar tu perfil profesional</li>
          <li>Configurar tu disponibilidad y tarifas</li>
          <li>Comenzar a recibir reservas de clientes</li>
          <li>Ofrecer sesiones de videollamada profesionales</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ir a mi Dashboard
          </a>
        </div>

        <p><strong>Próximos pasos:</strong></p>
        <ol>
          <li>Completa tu perfil con información detallada sobre tus servicios</li>
          <li>Sube una foto profesional</li>
          <li>Configura tu calendario de disponibilidad</li>
          <li>Define tus tarifas por sesión</li>
        </ol>

        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="color: #666; font-size: 14px;">
          ¡Bienvenido a la comunidad de Hosts de Dialoom!<br>
          El equipo de Dialoom
        </p>
      </div>
        `,
        textContent: `
      ¡Felicidades ${firstName}!

      Tu cuenta de Host en Dialoom ha sido verificada exitosamente.

      Ahora puedes:
      - Completar tu perfil profesional
      - Configurar tu disponibilidad y tarifas
      - Comenzar a recibir reservas de clientes
      - Ofrecer sesiones de videollamada profesionales

      Visita tu dashboard: ${dashboardLink}

      Próximos pasos:
      1. Completa tu perfil con información detallada sobre tus servicios
      2. Sube una foto profesional
      3. Configura tu calendario de disponibilidad
      4. Define tus tarifas por sesión

      Si tienes alguna pregunta, no dudes en contactarnos.

      ¡Bienvenido a la comunidad de Hosts de Dialoom!
      El equipo de Dialoom
        `
      }
    });
  }

  /**
   * Send host rejection notification email
   */
  async sendHostRejectionEmail(
    toEmail: string,
    firstName: string,
    reason: string,
    userId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: toEmail,
      templateType: 'user_message',
      userId,
      customTemplate: {
        subject: 'Actualización sobre tu solicitud de Host en Dialoom',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Hola ${firstName}</h2>

        <p>Gracias por tu interés en convertirte en Host en Dialoom.</p>

        <p>Después de revisar tu solicitud, lamentamos informarte que no podemos aprobar tu verificación en este momento por la siguiente razón:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><em>${reason}</em></p>
        </div>

        <p>Si crees que esto es un error o si puedes proporcionar documentación adicional, por favor contáctanos respondiendo a este correo.</p>

        <p>Apreciamos tu comprensión y esperamos poder trabajar contigo en el futuro.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="color: #666; font-size: 14px;">
          Saludos,<br>
          El equipo de Dialoom
        </p>
      </div>
        `,
        textContent: `
      Hola ${firstName}

      Gracias por tu interés en convertirte en Host en Dialoom.

      Después de revisar tu solicitud, lamentamos informarte que no podemos aprobar tu verificación en este momento por la siguiente razón:

      ${reason}

      Si crees que esto es un error o si puedes proporcionar documentación adicional, por favor contáctanos respondiendo a este correo.

      Apreciamos tu comprensión y esperamos poder trabajar contigo en el futuro.

      Saludos,
      El equipo de Dialoom
        `
      }
    });
  }
}

export const emailService = new EmailService();