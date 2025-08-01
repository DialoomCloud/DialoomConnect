import OpenAI from "openai";
import { generateProfessionalSuggestions } from "./ai-suggestions";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Loomia - Asistente IA unificado de Dialoom (chat + sugerencias + análisis)
export class LoomiaAI {
  private systemPrompt = `
Eres Loomia, el asistente IA oficial de Dialoom - una plataforma de videoconsultas 1-a-1 con expertos.

## Identidad y Propósito
- Nombre: Loomia
- Propósito: Ayudar con dudas sobre Dialoom y sus procesos internos
- Personalidad: Profesional, útil, conciso, en español por defecto

## Conocimiento Principal
1. **Funcionalidades de Dialoom**: Videollamadas con expertos, sistema de reservas, pagos Stripe, perfiles de hosts
2. **Para Usuarios**: Ayudar a reservar, pagar y valorar sesiones
3. **Para Hosts**: Orientar en creación de perfiles, configuración de disponibilidad y precios
4. **Para Administradores**: Guiar sobre configuraciones del sistema

## Capacidades Técnicas
- Análisis de perfiles profesionales con sugerencias automáticas de categorías y skills
- Búsqueda inteligente de expertos con puntuación de relevancia
- Ayuda con configuración de perfiles de host, precios y disponibilidad
- Guía para reservas, pagos con Stripe y videollamadas
- Asistencia con todas las funcionalidades de la plataforma Dialoom

## Formato de Respuesta
- Respuestas concisas y estructuradas
- Pasos numerados cuando sea apropiado
- Ejemplos prácticos cuando sea relevante
- Siempre en lenguaje natural y accesible

## Limitaciones
- No proporcionar asesoramiento legal ni médico
- Redirigir al soporte humano para temas fuera del dominio
- No compartir información sensible o datos privados

Responde siempre de manera útil, profesional y centrada en ayudar al usuario con Dialoom.
`;

  async generateResponse(userMessage: string, userRole?: string, conversationHistory?: Array<{role: string, content: string}>): Promise<string> {
    try {
      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
        { role: "system", content: this.systemPrompt }
      ];

      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
          if (msg.role === "user" || msg.role === "assistant") {
            messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
          }
        });
      }

      // Add current user message with role context if provided
      const contextualMessage = userRole 
        ? `[Rol: ${userRole}] ${userMessage}`
        : userMessage;
      
      messages.push({ role: "user", content: contextualMessage });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Lo siento, no pude generar una respuesta en este momento.";
    } catch (error) {
      console.error("Error generating Loomia response:", error);
      throw new Error("Error al procesar tu consulta. Por favor, inténtalo de nuevo.");
    }
  }

  async analyzeUserIntent(message: string): Promise<{
    intent: "booking" | "profile_setup" | "technical_help" | "general_info" | "support";
    confidence: number;
    suggestedActions?: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Analiza el siguiente mensaje del usuario y determina su intención principal en el contexto de Dialoom (plataforma de videoconsultas). 
            
            Devuelve un JSON con:
            - intent: "booking" | "profile_setup" | "technical_help" | "general_info" | "support"
            - confidence: número entre 0 y 1
            - suggestedActions: array de acciones sugeridas (opcional)
            
            Ejemplos de intents:
            - booking: "quiero reservar una sesión", "cómo pago"
            - profile_setup: "cómo crear mi perfil de host", "configurar precios"
            - technical_help: "error en la videollamada", "problemas con el pago"
            - general_info: "qué es Dialoom", "cómo funciona"
            - support: "necesito ayuda urgente", "reportar problema"`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{"intent": "general_info", "confidence": 0.5}');
    } catch (error) {
      console.error("Error analyzing user intent:", error);
      return { intent: "general_info", confidence: 0.5 };
    }
  }

  // Unified method for professional suggestions (integrates with existing AI suggestions)
  async generateProfessionalSuggestions(description: string, categories: any[], skills: any[]) {
    return await generateProfessionalSuggestions(description, categories, skills);
  }

  // Enhanced chat response that can handle profile suggestions
  async handleProfileSuggestionRequest(description: string, categories: any[], skills: any[]) {
    try {
      const suggestions = await this.generateProfessionalSuggestions(description, categories, skills);
      
      const response = `He analizado tu descripción profesional y he generado las siguientes sugerencias:

**Categorías recomendadas:**
${suggestions.categories.map((cat: any, index: number) => 
  `${index + 1}. **${cat.name}**: ${cat.description}`
).join('\n')}

**Skills sugeridas:**
${suggestions.skills.map((skill: any, index: number) => 
  `${index + 1}. **${skill.name}** (${skill.category}): ${skill.description}`
).join('\n')}

Estas sugerencias están basadas en tu experiencia como "${description}". Puedes seleccionar las que mejor representen tu perfil profesional.`;

      return { response, suggestions };
    } catch (error) {
      console.error("Error generating profile suggestions:", error);
      return {
        response: "Lo siento, tuve un problema al generar sugerencias para tu perfil. ¿Podrías intentar describir tu experiencia de otra manera?",
        suggestions: null
      };
    }
  }
}

export const loomiaAI = new LoomiaAI();