import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'noreply@dialoom.com';
const FROM_NAME = 'Dialoom';

export async function sendHostActivationEmail(
  toEmail: string,
  firstName: string,
  token: string,
  userId: string
): Promise<void> {
  const activationLink = `${process.env.REPLIT_DOMAINS || 'https://dialoom.cloud'}/api/host/activate/${token}?userId=${encodeURIComponent(userId)}`;
  
  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: 'Activa tu cuenta de Host en Dialoom',
    html: `
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
    text: `
      ¡Hola ${firstName}!
      
      Has solicitado convertirte en Host en Dialoom. Para activar tu cuenta y continuar con el proceso de verificación, visita el siguiente enlace:
      
      ${activationLink}
      
      Este enlace expirará en 24 horas.
      
      Una vez activada tu cuenta, podrás subir los documentos necesarios para verificar tu identidad y comenzar a ofrecer tus servicios en Dialoom.
      
      Si no solicitaste esta verificación, puedes ignorar este correo.
      
      Saludos,
      El equipo de Dialoom
    `
  };
  
  try {
    await sgMail.send(msg);
    console.log(`Host activation email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending host activation email:', error);
    throw error;
  }
}

export async function sendHostApprovalEmail(
  toEmail: string,
  firstName: string
): Promise<void> {
  const dashboardLink = 'https://dialoom.cloud/dashboard';
  
  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: '¡Felicidades! Tu cuenta de Host ha sido verificada',
    html: `
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
    text: `
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
  };
  
  try {
    await sgMail.send(msg);
    console.log(`Host approval email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending host approval email:', error);
    throw error;
  }
}

export async function sendHostRejectionEmail(
  toEmail: string,
  firstName: string,
  reason: string
): Promise<void> {
  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: 'Actualización sobre tu solicitud de Host en Dialoom',
    html: `
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
    text: `
      Hola ${firstName}
      
      Gracias por tu interés en convertirte en Host en Dialoom.
      
      Después de revisar tu solicitud, lamentamos informarte que no podemos aprobar tu verificación en este momento por la siguiente razón:
      
      ${reason}
      
      Si crees que esto es un error o si puedes proporcionar documentación adicional, por favor contáctanos respondiendo a este correo.
      
      Apreciamos tu comprensión y esperamos poder trabajar contigo en el futuro.
      
      Saludos,
      El equipo de Dialoom
    `
  };
  
  try {
    await sgMail.send(msg);
    console.log(`Host rejection email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending host rejection email:', error);
    throw error;
  }
}