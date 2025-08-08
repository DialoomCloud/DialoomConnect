import { Resend } from 'resend';
import Handlebars from 'handlebars';
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

export function renderTemplate(content: string, variables: EmailVariables): string {
  const template = Handlebars.compile(content);
  return template(variables);
}

class EmailService {
  /**
   * Send an email using a template or custom content
   */
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const { storage } = await import('./storage');
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
      subject = renderTemplate(subject, themeVariables);
      htmlContent = renderTemplate(htmlContent, themeVariables);
      if (textContent) {
        textContent = renderTemplate(textContent, themeVariables);
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
        userName,
        userEmail,
        platformName: 'Dialoom',
        changeDate: new Date().toLocaleDateString('es-ES'),
        supportEmail: 'support@dialoom.cloud',
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
        userName,
        userEmail,
        platformName: 'Dialoom',
        deletionDate: new Date().toLocaleDateString('es-ES'),
        supportEmail: 'support@dialoom.cloud',
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
        userName,
        userEmail,
        platformName: 'Dialoom',
        deactivationDate: new Date().toLocaleDateString('es-ES'),
        reactivationUrl: `${process.env.APP_URL || 'https://dialoom.cloud'}/auth`,
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
        resetLink,
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
    guestName: string,
    hostName: string,
    date: string,
    time: string,
    userId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: userEmail,
      templateType: 'booking_created',
      userId,
      variables: {
        guestName,
        hostName,
        date,
        time,
        dashboardUrl: `${process.env.APP_URL || 'https://dialoom.cloud'}/dashboard`,
      }
    });
  }

  /**
   * Send booking received email (to the host who received the booking)
   */
  async sendBookingReceivedEmail(
    hostEmail: string,
    hostName: string,
    guestName: string,
    guestEmail: string,
    date: string,
    time: string,
    price: number,
    hostId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail: hostEmail,
      templateType: 'booking_received',
      userId: hostId,
      variables: {
        hostName,
        guestName,
        guestEmail,
        date,
        time,
        price: `€${price}`,
        dashboardUrl: `${process.env.APP_URL || 'https://dialoom.cloud'}/dashboard`,
      }
    });
  }

  /**
   * Send user message notification email
   */
  async sendUserMessageEmail(
    recipientEmail: string,
    hostName: string,
    senderName: string,
    senderEmail: string,
    subject: string,
    message: string,
    recipientId?: string
  ): Promise<boolean> {
    return this.sendEmail({
      recipientEmail,
      templateType: 'user_message',
      userId: recipientId,
      variables: {
        hostName,
        senderName,
        senderEmail,
        subject,
        message,
        dashboardUrl: `${process.env.APP_URL || 'https://dialoom.cloud'}/dashboard`,
      }
    });
  }
}

export const emailService = new EmailService();
