import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../email-service';
import { DEFAULT_EMAIL_TEMPLATES } from '../email-templates-init';

describe('Email template variable replacement', () => {
  it('replaces variables in user_registration', () => {
    const template = DEFAULT_EMAIL_TEMPLATES.find(t => t.type === 'user_registration');
    if (!template) throw new Error('Template not found');
    const html = renderTemplate(template.htmlContent, {
      firstName: 'Juan',
      dashboardUrl: 'http://example.com',
      primaryColor: '#000',
      logoUrl: 'logo.png'
    });
    expect(html).toContain('Juan');
    expect(html).toContain('http://example.com');
  });

  it('processes conditionals in booking_received', () => {
    const template = DEFAULT_EMAIL_TEMPLATES.find(t => t.type === 'booking_received');
    if (!template) throw new Error('Template not found');
    const html = renderTemplate(template.htmlContent, {
      hostName: 'Ana',
      guestName: 'Luis',
      guestEmail: 'luis@example.com',
      date: '2025-01-01',
      time: '10:00',
      duration: 30,
      price: 50,
      bookingId: 'ABC123',
      dashboardUrl: 'http://example.com',
      services: {
        screenSharing: true,
        recording: true,
        translation: false,
        transcription: false
      }
    });
    expect(html).toContain('Ana');
    expect(html).toContain('Luis');
    expect(html).toContain('luis@example.com');
    expect(html).toContain('Compartir pantalla');
    expect(html).toContain('Grabación');
    expect(html).not.toContain('Traducción');
  });

  it('replaces variables in booking_created', () => {
    const template = DEFAULT_EMAIL_TEMPLATES.find(t => t.type === 'booking_created');
    if (!template) throw new Error('Template not found');
    const html = renderTemplate(template.htmlContent, {
      guestName: 'Carlos',
      hostName: 'Ana',
      date: '2025-01-01',
      time: '10:00',
      duration: 30,
      price: 50,
      bookingId: 'ABC123',
      dashboardUrl: 'http://example.com'
    });
    expect(html).toContain('Carlos');
    expect(html).toContain('Ana');
    expect(html).toContain('2025-01-01');
  });

  it('replaces variables in user_message', () => {
    const template = DEFAULT_EMAIL_TEMPLATES.find(t => t.type === 'user_message');
    if (!template) throw new Error('Template not found');
    const html = renderTemplate(template.htmlContent, {
      hostName: 'Ana',
      subject: 'Pregunta',
      senderName: 'Luis',
      senderEmail: 'luis@example.com',
      message: 'Hola mundo',
      dashboardUrl: 'http://example.com'
    });
    expect(html).toContain('Ana');
    expect(html).toContain('Pregunta');
    expect(html).toContain('Hola mundo');
  });
});
