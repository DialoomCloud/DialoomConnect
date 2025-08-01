import { storage } from "./storage";

const DEFAULT_EMAIL_TEMPLATES = [
  {
    type: 'user_registration',
    name: 'Registro de Usuario',
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
    type: 'booking_received',
    name: 'Reserva Recibida por Host',
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
    type: 'booking_created',
    name: 'Reserva Creada por Cliente',
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
    type: 'user_message',
    name: 'Mensaje de Usuario',
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