import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AISuggestion {
  categories: {
    name: string;
    description: string;
    subcategories?: string[];
  }[];
  skills: {
    name: string;
    category: string;
    description: string;
  }[];
}

export async function generateProfessionalSuggestions(
  userDescription: string,
  currentCategories: any[],
  currentSkills: any[]
): Promise<AISuggestion> {
  try {
    const prompt = `
Basándote en la siguiente descripción profesional de un usuario: "${userDescription}"

Y considerando las categorías existentes: ${JSON.stringify(currentCategories.map(c => ({ name: c.name, description: c.description })))}

Y las skills existentes: ${JSON.stringify(currentSkills.map(s => ({ name: s.name, category: s.category })))}

Sugiere nuevas categorías profesionales relevantes y skills/habilidades que coincidan con el perfil del usuario.

IMPORTANTE:
1. Solo sugiere categorías que NO estén ya en la lista existente
2. Solo sugiere skills que NO estén ya en la lista existente
3. Las categorías deben ser amplias y profesionales (ej: "Technology Leadership", "Educational Technology", "IT Management")
4. Las skills deben ser específicas y técnicas (ej: "Network Administration", "Team Leadership", "Project Management")
5. Todas las sugerencias deben estar en español
6. Máximo 5 categorías y 10 skills

Responde SOLO con un JSON válido en este formato:
{
  "categories": [
    {
      "name": "Nombre de la categoría",
      "description": "Descripción de la categoría",
      "subcategories": ["Subcategoría 1", "Subcategoría 2"]
    }
  ],
  "skills": [
    {
      "name": "Nombre de la skill",
      "category": "Categoría a la que pertenece",
      "description": "Descripción de la skill"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Eres un experto en clasificación profesional y análisis de perfiles laborales. Respondes únicamente con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate response structure
    if (!result.categories || !Array.isArray(result.categories)) {
      result.categories = [];
    }
    if (!result.skills || !Array.isArray(result.skills)) {
      result.skills = [];
    }

    return result as AISuggestion;
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return {
      categories: [],
      skills: []
    };
  }
}

export async function enhanceUserProfile(
  userDescription: string,
  existingCategories: string[],
  existingSkills: string[]
): Promise<{
  suggestedCategories: string[];
  suggestedSkills: string[];
  enhancedDescription: string;
}> {
  try {
    const prompt = `
Analiza esta descripción profesional: "${userDescription}"

Categorías actuales del usuario: ${existingCategories.join(", ")}
Skills actuales del usuario: ${existingSkills.join(", ")}

1. Sugiere 3-5 categorías profesionales adicionales que coincidan con el perfil
2. Sugiere 5-10 skills técnicas específicas que debería tener este profesional
3. Mejora la descripción profesional haciéndola más atractiva y profesional

Responde SOLO con JSON válido:
{
  "suggestedCategories": ["categoría1", "categoría2", ...],
  "suggestedSkills": ["skill1", "skill2", ...],
  "enhancedDescription": "Descripción mejorada del perfil profesional"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Eres un consultor de recursos humanos experto. Respondes únicamente con JSON válido en español."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.6
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      suggestedCategories: result.suggestedCategories || [],
      suggestedSkills: result.suggestedSkills || [],
      enhancedDescription: result.enhancedDescription || userDescription
    };
  } catch (error) {
    console.error("Error enhancing user profile:", error);
    return {
      suggestedCategories: [],
      suggestedSkills: [],
      enhancedDescription: userDescription
    };
  }
}