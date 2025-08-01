import { MailService } from '@sendgrid/mail';
import { storage } from './storage';
import { 
  EmailTemplate, 
  EmailNotification, 
  InsertEmailNotification,
  emailTemplateTypeEnum
} from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

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

      // Replace variables in content
      if (params.variables) {
        subject = this.replaceVariables(subject, params.variables);
        htmlContent = this.replaceVariables(htmlContent, params.variables);
        if (textContent) {
          textContent = this.replaceVariables(textContent, params.variables);
        }
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

      // Send email via SendGrid
      await mailService.send({
        to: params.recipientEmail,
        from: 'notifications@dialoom.cloud', // TODO: Make this configurable
        subject,
        html: htmlContent,
        text: textContent,
      });

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
        user_name: userName,
        user_email: userEmail,
        platform_name: 'Dialoom',
        login_url: `${process.env.APP_URL || 'https://dialoom.cloud'}/auth`,
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
}

export const emailService = new EmailService();