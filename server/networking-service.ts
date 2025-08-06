import OpenAI from "openai";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NetworkingMatch {
  userId: string;
  matchType: 'skills_complement' | 'common_interests' | 'similar_goals' | 'location_based';
  matchScore: number;
  reasoning: string;
}

export class NetworkingRecommendationService {
  
  /**
   * Generate networking recommendations for a user using AI analysis
   */
  async generateRecommendationsForUser(userId: string): Promise<NetworkingMatch[]> {
    try {
      // Get user profile and preferences
      const user = await storage.getUserWithPrivateInfo(userId, userId);
      if (!user) throw new Error('User not found');

      const preferences = await storage.getUserNetworkingPreferences(userId);
      
      // Get potential matches (excluding the user themselves and existing connections)
      const potentialMatches = await storage.getPotentialNetworkingMatches(userId);
      
      if (potentialMatches.length === 0) {
        return [];
      }

      // Get user skills and categories for AI analysis
      const userWithSkills = await storage.getUserWithSkillsAndCategories(userId);
      const matchesWithSkills = await Promise.all(
        potentialMatches.map(match => storage.getUserWithSkillsAndCategories(match.id))
      );

      // Use AI to analyze and score matches
      const recommendations = await this.analyzeMatches(
        userWithSkills || user, 
        matchesWithSkills.filter(Boolean) as User[], 
        preferences
      );
      
      // Filter and sort by relevance
      return recommendations
        .filter(rec => rec.matchScore >= 60) // Only high-quality matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 recommendations
        
    } catch (error) {
      console.error('Error generating networking recommendations:', error);
      throw error;
    }
  }

  /**
   * Use OpenAI to analyze user compatibility and generate match scores
   */
  private async analyzeMatches(
    user: User, 
    potentialMatches: User[], 
    preferences: any
  ): Promise<NetworkingMatch[]> {
    try {
      const prompt = `
As a professional networking AI, analyze the compatibility between users for networking opportunities.

Current User Profile:
- Name: ${user.firstName} ${user.lastName}
- Title: ${user.title || 'Not specified'}
- Description: ${user.description || 'Not specified'}
- Skills: ${(user as any).skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
- Categories: ${(user as any).categories?.map((c: any) => c.name).join(', ') || 'Not specified'}
- Location: ${user.city || 'Not specified'}, ${user.nationality || 'Not specified'}
- Video Call Topics: ${user.videoCallTopics?.join(', ') || 'Not specified'}
- Networking Goals: ${preferences?.preferredNetworkingGoals?.join(', ') || 'General networking'}
- Experience Level: ${preferences?.experienceLevel || 'Not specified'}
- Looking for Mentor: ${preferences?.lookingForMentor ? 'Yes' : 'No'}
- Interested in Mentoring: ${preferences?.interestedInMentoring ? 'Yes' : 'No'}
- Open to Collaboration: ${preferences?.openToCollaboration ? 'Yes' : 'No'}

Potential Matches:
${potentialMatches.map((match, index) => `
${index + 1}. User ID: ${match.id}
   Name: ${match.firstName} ${match.lastName}
   Title: ${match.title || 'Not specified'}
   Description: ${match.description || 'Not specified'}
   Skills: ${(match as any).skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
   Categories: ${(match as any).categories?.map((c: any) => c.name).join(', ') || 'Not specified'}
   Location: ${match.city || 'Not specified'}, ${match.nationality || 'Not specified'}
   Video Call Topics: ${match.videoCallTopics?.join(', ') || 'Not specified'}
   Is Host: ${match.isHost ? 'Yes' : 'No'}
`).join('\n')}

For each potential match, analyze the compatibility and provide a JSON response with this exact format:

{
  "recommendations": [
    {
      "userId": "match_user_id",
      "matchType": "skills_complement" | "common_interests" | "similar_goals" | "location_based",
      "matchScore": 0-100,
      "reasoning": "Brief explanation of why this is a good match (max 100 words)"
    }
  ]
}

Evaluation Criteria:
1. Skills Complement (70-100): One has skills the other needs, or vice versa
2. Common Interests (60-90): Similar professional interests, categories, or goals
3. Similar Goals (65-95): Both seeking similar outcomes (mentorship, collaboration, etc.)
4. Location Based (50-80): Geographic proximity for potential in-person meetings

Only include matches with scores 60+ and provide concrete reasoning based on the actual profile data.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations":[]}');
      return result.recommendations || [];

    } catch (error) {
      console.error('Error analyzing matches with AI:', error);
      return [];
    }
  }

  /**
   * Update recommendation status when user interacts with it
   */
  async updateRecommendationStatus(
    userId: string, 
    recommendationId: string, 
    status: 'viewed' | 'contacted' | 'dismissed'
  ): Promise<void> {
    try {
      await storage.updateNetworkingRecommendationStatus(userId, recommendationId, status);
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      throw error;
    }
  }

  /**
   * Get user's networking recommendations from database
   */
  async getUserRecommendations(userId: string): Promise<any[]> {
    try {
      return await storage.getUserNetworkingRecommendations(userId);
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      throw error;
    }
  }

  /**
   * Save generated recommendations to database
   */
  async saveRecommendations(userId: string, recommendations: NetworkingMatch[]): Promise<void> {
    try {
      // Clear old recommendations first
      await storage.clearOldNetworkingRecommendations(userId);
      
      // Save new recommendations
      for (const rec of recommendations) {
        await storage.createNetworkingRecommendation({
          userId,
          recommendedUserId: rec.userId,
          matchType: rec.matchType,
          matchScore: rec.matchScore.toString(),
          reasoning: rec.reasoning,
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  }
}

export const networkingService = new NetworkingRecommendationService();