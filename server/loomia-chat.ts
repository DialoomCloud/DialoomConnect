import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class LoomiaAI {
  async improveDescription(description: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Eres Loomia, el asistente inteligente de Dialoom. Tu tarea es mejorar las descripciones profesionales de los Hosts para que sean más atractivas y completas.

Instrucciones:
- Mejora la descripción manteniendo la información original
- Hazla más profesional y atractiva
- Añade estructura si es necesaria (párrafos, puntos clave)
- Mantén un tono profesional pero cercano
- Enfócate en las fortalezas y experiencia del profesional
- Sugiere cómo puede ayudar a los clientes
- Limita la respuesta a un máximo de 300 palabras
- Responde ÚNICAMENTE con la descripción mejorada, sin explicaciones adicionales

La descripción debe estar en español y ser adecuada para un perfil profesional de videollamadas de consultoría.`
          },
          {
            role: "user",
            content: `Mejora esta descripción profesional: "${description}"`
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || description;
    } catch (error) {
      console.error("Error improving description with Loomia:", error);
      throw new Error("No se pudo mejorar la descripción en este momento");
    }
  }

  async generateCategorySuggestions(description: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Eres Loomia, el asistente inteligente de Dialoom. Analiza la descripción profesional y sugiere categorías profesionales relevantes.

Categorías disponibles: Tecnología, Negocios, Marketing, Diseño, Educación, Salud, Finanzas, Legal, Recursos Humanos, Consultoría, Desarrollo Personal, Arte y Creatividad, Ciencias, Ingeniería, Medicina, Psicología, Coaching, Ventas, Administración, Comunicación.

Responde con un JSON que contenga un array de categorías sugeridas (máximo 3):
{"categories": ["Categoría1", "Categoría2", "Categoría3"]}`
          },
          {
            role: "user",
            content: `Analiza esta descripción y sugiere categorías: "${description}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"categories": []}');
      return result.categories || [];
    } catch (error) {
      console.error("Error generating category suggestions:", error);
      return [];
    }
  }

  async generateSkillSuggestions(description: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Eres Loomia, el asistente inteligente de Dialoom. Analiza la descripción profesional y sugiere habilidades específicas relevantes.

Sugiere habilidades técnicas, blandas y profesionales que sean relevantes para el perfil descrito.

Responde con un JSON que contenga un array de habilidades sugeridas (máximo 8):
{"skills": ["Habilidad1", "Habilidad2", "Habilidad3"]}`
          },
          {
            role: "user",
            content: `Analiza esta descripción y sugiere habilidades: "${description}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"skills": []}');
      return result.skills || [];
    } catch (error) {
      console.error("Error generating skill suggestions:", error);
      return [];
    }
  }

  async generateProfessionalSuggestions(description: string): Promise<{
    categories: string[];
    skills: string[];
  }> {
    try {
      const categoriesPromise = this.generateCategorySuggestions(description);
      const skillsPromise = this.generateSkillSuggestions(description);
      
      const [categories, skills] = await Promise.all([categoriesPromise, skillsPromise]);
      
      return {
        categories,
        skills
      };
    } catch (error) {
      console.error("Error generating professional suggestions:", error);
      return {
        categories: [],
        skills: []
      };
    }
  }

  async analyzeSocialProfiles(socialUrls: { platform: string; url: string }[]): Promise<string> {
    try {
      if (!socialUrls || socialUrls.length === 0) {
        return "";
      }

      const profilesInfo = socialUrls
        .map(social => `${social.platform}: ${social.url}`)
        .join("\n");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analiza las URLs de perfiles sociales proporcionadas y extrae información profesional relevante que pueda ayudar a mejorar la descripción del perfil del usuario en Dialoom.

Busca patrones como:
- Especialidades profesionales
- Experiencia destacada
- Sectores o industrias
- Herramientas o tecnologías
- Logros o certificaciones

Devuelve un resumen breve y relevante de máximo 3 líneas.`
          },
          {
            role: "user",
            content: `Analiza estos perfiles sociales:\n${profilesInfo}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error analyzing social profiles:", error);
      return "";
    }
  }

  async improveDescriptionWithSocialContext(
    currentDescription: string,
    socialUrls?: { platform: string; url: string }[]
  ): Promise<string> {
    try {
      let socialContext = "";
      if (socialUrls && socialUrls.length > 0) {
        socialContext = await this.analyzeSocialProfiles(socialUrls);
      }

      const prompt = socialContext
        ? `Descripción actual: "${currentDescription}"\n\nInformación extraída de perfiles sociales: ${socialContext}\n\nMejora la descripción combinando ambas fuentes de información.`
        : `Descripción actual: "${currentDescription}"`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Eres Loomia, el asistente de IA de Dialoom. Tu tarea es mejorar descripciones profesionales para perfiles de hosts expertos.

Directrices:
1. Mantén un tono profesional pero accesible
2. Destaca las fortalezas y experiencia única
3. Usa verbos de acción y logros específicos cuando sea posible
4. Optimiza para búsquedas manteniendo naturalidad
5. Máximo 4-5 líneas
6. Si tienes información de perfiles sociales, úsala para enriquecer la descripción
7. Escribe en el mismo idioma que la descripción original

IMPORTANTE: Devuelve SOLO la descripción mejorada, sin comillas ni explicaciones adicionales.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || currentDescription;
    } catch (error) {
      console.error("Error improving description with social context:", error);
      throw error;
    }
  }

  async chatResponse(message: string, context?: string): Promise<string> {
    try {
      const systemMessage = `Eres Loomia, el asistente inteligente de Dialoom, una plataforma de videollamadas profesionales que conecta expertos con clientes.

Tu personalidad:
- Profesional pero cercano y amigable
- Conocedor de la plataforma Dialoom y sus características
- Siempre dispuesto a ayudar con consultas sobre la plataforma
- Eficiente y directo en tus respuestas
- Capaz de ayudar con perfiles, reservas, pagos y uso general

Funciones de Dialoom que conoces:
- Reserva de videollamadas con Hosts expertos
- Perfiles profesionales detallados
- Sistema de pagos con Stripe
- Categorías profesionales variadas
- Disponibilidad de horarios flexible
- Soporte multiidioma (ES, EN, CA)

Responde siempre en español y mantén las respuestas concisas pero útiles.`;

      const messages: any[] = [
        { role: "system", content: systemMessage }
      ];

      if (context) {
        messages.push({ role: "system", content: `Contexto adicional: ${context}` });
      }

      messages.push({ role: "user", content: message });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || "No pude procesar tu consulta en este momento.";
    } catch (error) {
      console.error("Error generating chat response:", error);
      return "Lo siento, no puedo responder en este momento. Por favor intenta de nuevo.";
    }
  }
}

  async improveDescription(description: string): Promise<string> {
    // Wrapper function for backward compatibility
    return this.improveDescriptionWithSocialContext(description);
  }
}

export const loomiaAI = new LoomiaAI();