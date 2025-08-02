import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface TranslationRequest {
  title: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  sourceLanguage: string;
  targetLanguages: string[];
}

export interface TranslatedArticle {
  language: string;
  title: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export async function translateArticle(
  request: TranslationRequest
): Promise<TranslatedArticle[]> {
  const translations: TranslatedArticle[] = [];

  for (const targetLang of request.targetLanguages) {
    if (targetLang === request.sourceLanguage) continue;

    try {
      // Prepare the translation prompt
      const languageMap: { [key: string]: string } = {
        'es': 'Spanish',
        'en': 'English',
        'ca': 'Catalan'
      };

      const prompt = `
You are a professional translator for a news website. Translate the following article from ${languageMap[request.sourceLanguage] || request.sourceLanguage} to ${languageMap[targetLang] || targetLang}.

Important instructions:
1. Maintain the same HTML structure and formatting
2. Keep all HTML tags intact (don't translate tag names)
3. Translate only the text content
4. Preserve the tone and style of the original
5. For YouTube embeds and other media elements, keep the HTML structure unchanged
6. If there are hashtags in tags, translate them appropriately

Article to translate:
Title: ${request.title}
${request.excerpt ? `Excerpt: ${request.excerpt}` : ''}
Content: ${request.content}
${request.tags?.length ? `Tags: ${request.tags.join(', ')}` : ''}
${request.metaTitle ? `Meta Title: ${request.metaTitle}` : ''}
${request.metaDescription ? `Meta Description: ${request.metaDescription}` : ''}

Please respond with a JSON object containing the translated fields in this exact format:
{
  "title": "translated title",
  "excerpt": "translated excerpt or null if not provided",
  "content": "translated content with HTML preserved",
  "tags": ["translated", "tags"] or null if not provided,
  "metaTitle": "translated meta title or null if not provided",
  "metaDescription": "translated meta description or null if not provided"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Always respond with valid JSON containing the translated content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent translations
      });

      const translatedData = JSON.parse(response.choices[0].message.content || '{}');

      translations.push({
        language: targetLang,
        title: translatedData.title || request.title,
        excerpt: translatedData.excerpt || request.excerpt,
        content: translatedData.content || request.content,
        tags: translatedData.tags || request.tags,
        metaTitle: translatedData.metaTitle || request.metaTitle,
        metaDescription: translatedData.metaDescription || request.metaDescription,
      });

    } catch (error) {
      console.error(`Error translating to ${targetLang}:`, error);
      // Continue with other translations even if one fails
    }
  }

  return translations;
}

// Function to detect the source language from content
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Detect the language of the given text. Respond with only the language code: 'es' for Spanish, 'en' for English, or 'ca' for Catalan."
        },
        {
          role: "user",
          content: text.substring(0, 500) // Use first 500 chars for detection
        }
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const detectedLang = response.choices[0].message.content?.trim().toLowerCase();
    return ['es', 'en', 'ca'].includes(detectedLang || '') ? detectedLang! : 'es'; // Default to Spanish
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'es'; // Default to Spanish
  }
}