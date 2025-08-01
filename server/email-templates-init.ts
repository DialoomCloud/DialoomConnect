import { storage } from "./storage";

const DEFAULT_EMAIL_TEMPLATES = [
  {
    type: 'registration',
    subject: 'Bienvenido a Dialoom - Tu cuenta ha sido creada',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00A1A7; color: white; padding: 20px; text-align: center;">
          <h1>¡Bienvenido a Dialoom!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{firstName}},</p>
          <p>¡Tu cuenta en Dialoom ha sido creada exitosamente!</p>
          <p>Ya puedes comenzar a conectar con hosts y programar videollamadas profesionales.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Ir a mi Dashboard
            </a>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>¡Bienvenido a la comunidad Dialoom!</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      ¡Bienvenido a Dialoom!
      
      Hola {{firstName}},
      
      ¡Tu cuenta en Dialoom ha sido creada exitosamente!
      
      Ya puedes comenzar a conectar con hosts y programar videollamadas profesionales.
      
      Accede a tu dashboard en: {{dashboardUrl}}
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      ¡Bienvenido a la comunidad Dialoom!
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  },
  {
    type: 'booking_confirmation',
    subject: 'Nueva reserva de videollamada recibida - Dialoom',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00A1A7; color: white; padding: 20px; text-align: center;">
          <h1>Nueva Reserva Recibida</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{hostName}},</p>
          <p>Has recibido una nueva reserva de videollamada:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la Reserva</h3>
            <p><strong>Cliente:</strong> {{guestName}} ({{guestEmail}})</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Hora:</strong> {{time}}</p>
            <p><strong>Duración:</strong> {{duration}} minutos</p>
            <p><strong>Precio:</strong> €{{price}}</p>
            <p><strong>ID de Reserva:</strong> {{bookingId}}</p>
          </div>
          
          {{#if services}}
          <div style="background-color: #e8f4f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Servicios Adicionales</h3>
            <ul>
              {{#if services.screenSharing}}<li>Compartir pantalla</li>{{/if}}
              {{#if services.translation}}<li>Traducción</li>{{/if}}
              {{#if services.recording}}<li>Grabación</li>{{/if}}
              {{#if services.transcription}}<li>Transcripción</li>{{/if}}
            </ul>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Ver en Dashboard
            </a>
          </div>
          
          <p><em>Nota: La reserva se confirmará automáticamente una vez que se procese el pago.</em></p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      Nueva Reserva Recibida - Dialoom
      
      Hola {{hostName}},
      
      Has recibido una nueva reserva de videollamada:
      
      DETALLES DE LA RESERVA
      Cliente: {{guestName}} ({{guestEmail}})
      Fecha: {{date}}
      Hora: {{time}}
      Duración: {{duration}} minutos
      Precio: €{{price}}
      ID de Reserva: {{bookingId}}
      
      Ver en Dashboard: {{dashboardUrl}}
      
      Nota: La reserva se confirmará automáticamente una vez que se procese el pago.
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  },
  {
    type: 'booking_notification',
    subject: 'Reserva de videollamada creada - Dialoom',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00A1A7; color: white; padding: 20px; text-align: center;">
          <h1>Reserva Creada</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{guestName}},</p>
          <p>Tu reserva de videollamada ha sido creada exitosamente:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de tu Reserva</h3>
            <p><strong>Host:</strong> {{hostName}}</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Hora:</strong> {{time}}</p>
            <p><strong>Duración:</strong> {{duration}} minutos</p>
            <p><strong>Precio:</strong> €{{price}}</p>
            <p><strong>ID de Reserva:</strong> {{bookingId}}</p>
          </div>
          
          <p><strong>Estado:</strong> Pendiente de pago</p>
          <p>Por favor procede con el pago para confirmar tu reserva.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Ver Reserva
            </a>
          </div>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      Reserva Creada - Dialoom
      
      Hola {{guestName}},
      
      Tu reserva de videollamada ha sido creada exitosamente:
      
      DETALLES DE TU RESERVA
      Host: {{hostName}}
      Fecha: {{date}}
      Hora: {{time}}
      Duración: {{duration}} minutos
      Precio: €{{price}}
      ID de Reserva: {{bookingId}}
      
      Estado: Pendiente de pago
      Por favor procede con el pago para confirmar tu reserva.
      
      Ver Reserva: {{dashboardUrl}}
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  },
  {
    type: 'payment_confirmation',
    subject: 'Pago confirmado - Tu videollamada está confirmada',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
          <h1>¡Pago Confirmado!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{guestName}},</p>
          <p>Tu pago ha sido procesado exitosamente y tu videollamada está confirmada.</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <h3>Detalles de tu Videollamada</h3>
            <p><strong>Host:</strong> {{hostName}}</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Hora:</strong> {{time}}</p>
            <p><strong>Duración:</strong> {{duration}} minutos</p>
            <p><strong>Monto pagado:</strong> €{{amount}}</p>
            <p><strong>Factura:</strong> #{{invoiceNumber}}</p>
            <p><strong>ID de Reserva:</strong> {{bookingId}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Acceder a la Videollamada
            </a>
          </div>
          
          <p><em>Recibirás un recordatorio antes de la hora programada.</em></p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      ¡Pago Confirmado! - Dialoom
      
      Hola {{guestName}},
      
      Tu pago ha sido procesado exitosamente y tu videollamada está confirmada.
      
      DETALLES DE TU VIDEOLLAMADA
      Host: {{hostName}}
      Fecha: {{date}}
      Hora: {{time}}
      Duración: {{duration}} minutos
      Monto pagado: €{{amount}}
      Factura: #{{invoiceNumber}}
      ID de Reserva: {{bookingId}}
      
      Acceder a la Videollamada: {{dashboardUrl}}
      
      Recibirás un recordatorio antes de la hora programada.
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  },
  {
    type: 'booking_confirmed',
    subject: 'Reserva confirmada - Pago recibido',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
          <h1>¡Reserva Confirmada!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{hostName}},</p>
          <p>El pago para tu videollamada ha sido recibido y la reserva está confirmada.</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <h3>Detalles de la Videollamada</h3>
            <p><strong>Cliente:</strong> {{guestName}}</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Hora:</strong> {{time}}</p>
            <p><strong>Duración:</strong> {{duration}} minutos</p>
            <p><strong>Monto:</strong> €{{amount}}</p>
            <p><strong>ID de Reserva:</strong> {{bookingId}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Preparar Videollamada
            </a>
          </div>
          
          <p><em>Te enviaremos un recordatorio antes de la hora programada.</em></p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      ¡Reserva Confirmada! - Dialoom
      
      Hola {{hostName}},
      
      El pago para tu videollamada ha sido recibido y la reserva está confirmada.
      
      DETALLES DE LA VIDEOLLAMADA
      Cliente: {{guestName}}
      Fecha: {{date}}
      Hora: {{time}}
      Duración: {{duration}} minutos
      Monto: €{{amount}}
      ID de Reserva: {{bookingId}}
      
      Preparar Videollamada: {{dashboardUrl}}
      
      Te enviaremos un recordatorio antes de la hora programada.
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  },
  {
    type: 'booking_cancellation',
    subject: 'Reserva cancelada - Dialoom',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1>Reserva Cancelada</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{userName}},</p>
          <p>Una reserva de videollamada ha sido cancelada:</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f5c6cb;">
            <h3>Detalles de la Reserva Cancelada</h3>
            <p><strong>{{#if cancelledByHost}}Host{{else}}Cliente{{/if}}:</strong> {{otherPersonName}}</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Hora:</strong> {{time}}</p>
            <p><strong>Duración:</strong> {{duration}} minutos</p>
            <p><strong>Cancelada por:</strong> {{#if cancelledByHost}}Host{{else}}Cliente{{/if}}</p>
            <p><strong>ID de Reserva:</strong> {{bookingId}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Ver Dashboard
            </a>
          </div>
          
          <p><em>Si hubo un pago procesado, se procederá con el reembolso correspondiente.</em></p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      Reserva Cancelada - Dialoom
      
      Hola {{userName}},
      
      Una reserva de videollamada ha sido cancelada:
      
      DETALLES DE LA RESERVA CANCELADA
      {{#if cancelledByHost}}Host{{else}}Cliente{{/if}}: {{otherPersonName}}
      Fecha: {{date}}
      Hora: {{time}}
      Duración: {{duration}} minutos
      Cancelada por: {{#if cancelledByHost}}Host{{else}}Cliente{{/if}}
      ID de Reserva: {{bookingId}}
      
      Ver Dashboard: {{dashboardUrl}}
      
      Si hubo un pago procesado, se procederá con el reembolso correspondiente.
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  },
  {
    type: 'user_message',
    subject: 'Nuevo mensaje recibido - Dialoom',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00A1A7; color: white; padding: 20px; text-align: center;">
          <h1>Nuevo Mensaje</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hola {{hostName}},</p>
          <p>Has recibido un nuevo mensaje a través de tu perfil en Dialoom:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>{{subject}}</h3>
            <p><strong>De:</strong> {{senderName}} ({{senderEmail}})</p>
            <div style="background-color: white; padding: 15px; border-radius: 3px; margin: 10px 0;">
              {{message}}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background-color: #00A1A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Ver Mensajes
            </a>
          </div>
          
          <p><em>Puedes responder directamente desde tu dashboard o contactar al remitente en su email.</em></p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          © 2025 Dialoom. Todos los derechos reservados.
        </div>
      </div>
    `,
    textContent: `
      Nuevo Mensaje - Dialoom
      
      Hola {{hostName}},
      
      Has recibido un nuevo mensaje a través de tu perfil en Dialoom:
      
      ASUNTO: {{subject}}
      DE: {{senderName}} ({{senderEmail}})
      
      MENSAJE:
      {{message}}
      
      Ver Mensajes: {{dashboardUrl}}
      
      Puedes responder directamente desde tu dashboard o contactar al remitente en su email.
      
      © 2025 Dialoom. Todos los derechos reservados.
    `,
    isActive: true
  }
];

export async function initializeEmailTemplates() {
  try {
    console.log('Inicializando plantillas de email...');
    
    for (const template of DEFAULT_EMAIL_TEMPLATES) {
      // Check if template already exists
      const templates = await storage.getAllEmailTemplates();
      const exists = templates.some((t: any) => t.type === template.type);
      
      if (!exists) {
        await storage.createEmailTemplate(template);
        console.log(`Plantilla '${template.type}' creada.`);
      } else {
        console.log(`Plantilla '${template.type}' ya existe.`);
      }
    }
    
    console.log('Inicialización de plantillas de email completada.');
  } catch (error) {
    console.error('Error inicializando plantillas de email:', error);
  }
}