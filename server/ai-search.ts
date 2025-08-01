import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface HostProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  professionalCategory?: string;
  skills?: string[];
  languages?: string[];
  email?: string;
}

export interface SearchIntent {
  keywords: string[];
  concepts: string[];
  professions: string[];
  skills: string[];
  confidence: number;
}

export class AISearchService {
  
  // Analiza la intención de búsqueda del usuario usando IA
  async analyzeSearchIntent(query: string): Promise<SearchIntent> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Eres un asistente especializado en análizar búsquedas de profesionales y expertos. Tu trabajo es extraer la intención de búsqueda del usuario y sugerir términos relacionados.

Analiza la consulta del usuario y proporciona:
1. keywords: Palabras clave directas de la búsqueda
2. concepts: Conceptos relacionados y sinónimos
3. professions: Profesiones que podrían estar relacionadas
4. skills: Habilidades técnicas relacionadas
5. confidence: Nivel de confianza (0-1) en el análisis

Responde SOLO en formato JSON válido con esta estructura:
{
  "keywords": ["palabra1", "palabra2"],
  "concepts": ["concepto1", "concepto2"],
  "professions": ["profesión1", "profesión2"],
  "skills": ["habilidad1", "habilidad2"],
  "confidence": 0.85
}

Ejemplos:
- "astronauta" → keywords: ["astronauta"], concepts: ["espacio", "astronómia", "NASA", "cosmos"], professions: ["astronauta", "ingeniero aeroespacial", "físico"], skills: ["navegación espacial", "ciencias espaciales"]
- "cocina" → keywords: ["cocina"], concepts: ["gastronomía", "chef", "culinario"], professions: ["chef", "cocinero", "nutricionista"], skills: ["técnicas culinarias", "manejo de ingredientes"]`
          },
          {
            role: "user",
            content: query
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        keywords: result.keywords || [],
        concepts: result.concepts || [],
        professions: result.professions || [],
        skills: result.skills || [],
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Error analyzing search intent:", error);
      // Fallback to simple keyword extraction
      const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      return {
        keywords,
        concepts: [],
        professions: [],
        skills: [],
        confidence: 0.3
      };
    }
  }

  // Calcula la relevancia de un host para la búsqueda usando IA
  async calculateHostRelevance(host: HostProfile, searchIntent: SearchIntent): Promise<number> {
    try {
      // Crear texto del perfil del host
      const hostText = [
        host.firstName,
        host.lastName,
        host.title,
        host.bio,
        host.professionalCategory,
        ...(host.skills || []),
        ...(host.languages || [])
      ].filter(Boolean).join(" ").toLowerCase();

      // Crear texto de búsqueda
      const searchText = [
        ...searchIntent.keywords,
        ...searchIntent.concepts,
        ...searchIntent.professions,
        ...searchIntent.skills
      ].join(" ").toLowerCase();

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Eres un experto en matching de perfiles profesionales. Analiza la relevancia entre un perfil de host y una búsqueda.

Evalúa qué tan bien coincide el perfil del host con la búsqueda del usuario en una escala de 0.0 a 1.0:
- 1.0: Coincidencia perfecta
- 0.8-0.9: Muy relevante
- 0.6-0.7: Bastante relevante  
- 0.4-0.5: Algo relevante
- 0.2-0.3: Poco relevante
- 0.0-0.1: No relevante

Considera:
- Coincidencias exactas en profesión/título
- Habilidades relacionadas
- Experiencia en áreas similares
- Conceptos relacionados

Responde SOLO con un número decimal entre 0.0 y 1.0, sin texto adicional.`
          },
          {
            role: "user",
            content: `Perfil del host: ${hostText}

Búsqueda del usuario: ${searchText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const relevanceText = response.choices[0].message.content?.trim() || "0.0";
      let relevance = parseFloat(relevanceText);
      
      // Validar y ajustar el resultado
      if (isNaN(relevance) || relevance < 0) relevance = 0;
      if (relevance > 1) relevance = 1;
      
      return relevance;
    } catch (error) {
      console.error("Error calculating host relevance:", error);
      // Fallback a búsqueda básica por palabras clave
      return this.basicKeywordMatch(host, searchIntent);
    }
  }

  // Búsqueda básica por palabras clave como fallback
  private basicKeywordMatch(host: HostProfile, searchIntent: SearchIntent): number {
    const hostText = [
      host.firstName,
      host.lastName,
      host.title,
      host.bio,
      host.professionalCategory,
      ...(host.skills || []),
      ...(host.languages || [])
    ].filter(Boolean).join(" ").toLowerCase();

    const allSearchTerms = [
      ...searchIntent.keywords,
      ...searchIntent.concepts,
      ...searchIntent.professions,
      ...searchIntent.skills
    ].map(term => term.toLowerCase());

    let matches = 0;
    let totalTerms = allSearchTerms.length;

    for (const term of allSearchTerms) {
      if (hostText.includes(term)) {
        matches++;
      }
    }

    return totalTerms > 0 ? matches / totalTerms : 0;
  }

  // Buscar hosts usando IA
  async searchHosts(hosts: HostProfile[], query: string): Promise<{ host: HostProfile; relevance: number }[]> {
    if (!query.trim()) {
      return hosts.map(host => ({ host, relevance: 1 }));
    }

    // Analizar intención de búsqueda
    const searchIntent = await this.analyzeSearchIntent(query);
    
    // Calcular relevancia para cada host
    const results: { host: HostProfile; relevance: number }[] = [];
    
    for (const host of hosts) {
      const relevance = await this.calculateHostRelevance(host, searchIntent);
      results.push({ host, relevance });
    }

    // Ordenar por relevancia descendente
    return results
      .filter(result => result.relevance > 0.1) // Filtrar resultados con muy baja relevancia
      .sort((a, b) => b.relevance - a.relevance);
  }
}

export const aiSearchService = new AISearchService();