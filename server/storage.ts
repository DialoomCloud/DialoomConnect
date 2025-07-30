import {
  users,
  mediaContent,
  countries,
  languages,
  skills,
  categories,
  userLanguages,
  userSkills,
  type User,
  type UpsertUser,
  type MediaContent,
  type InsertMediaContent,
  type UpdateUserProfile,
  type Country,
  type Language,
  type Skill,
  type Category,
  type UserLanguage,
  type UserSkill,
  type InsertUserLanguage,
  type InsertUserSkill,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  
  // Media content operations
  getUserMediaContent(userId: string): Promise<MediaContent[]>;
  createMediaContent(content: InsertMediaContent): Promise<MediaContent>;
  updateMediaContent(id: string, content: Partial<InsertMediaContent>): Promise<MediaContent>;
  deleteMediaContent(id: string, userId: string): Promise<boolean>;

  // Reference data operations
  getCountries(): Promise<Country[]>;
  getLanguages(): Promise<Language[]>;
  getSkills(): Promise<Skill[]>;
  getCategories(): Promise<Category[]>;

  // User relations operations
  getUserLanguages(userId: string): Promise<UserLanguage[]>;
  getUserSkills(userId: string): Promise<UserSkill[]>;
  updateUserLanguages(userId: string, languageIds: number[]): Promise<void>;
  updateUserSkills(userId: string, skillIds: number[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Media content operations
  async getUserMediaContent(userId: string): Promise<MediaContent[]> {
    return await db
      .select()
      .from(mediaContent)
      .where(eq(mediaContent.userId, userId))
      .orderBy(desc(mediaContent.createdAt));
  }

  async createMediaContent(content: InsertMediaContent): Promise<MediaContent> {
    const [newContent] = await db
      .insert(mediaContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateMediaContent(id: string, content: Partial<InsertMediaContent>): Promise<MediaContent> {
    const [updatedContent] = await db
      .update(mediaContent)
      .set({
        ...content,
        updatedAt: new Date(),
      })
      .where(eq(mediaContent.id, id))
      .returning();
    return updatedContent;
  }

  async deleteMediaContent(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(mediaContent)
      .where(and(eq(mediaContent.id, id), eq(mediaContent.userId, userId)));
    return (result?.rowCount || 0) > 0;
  }

  // Reference data methods
  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries).where(eq(countries.isActive, true));
  }

  async getLanguages(): Promise<Language[]> {
    return await db.select().from(languages).where(eq(languages.isActive, true));
  }

  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.isActive, true));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  // User relations methods
  async getUserLanguages(userId: string): Promise<UserLanguage[]> {
    return await db.select().from(userLanguages).where(eq(userLanguages.userId, userId));
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await db.select().from(userSkills).where(eq(userSkills.userId, userId));
  }

  async updateUserLanguages(userId: string, languageIds: number[]): Promise<void> {
    try {
      console.log(`Updating languages for user ${userId}:`, languageIds);
      
      // Delete existing languages
      const deleteResult = await db.delete(userLanguages).where(eq(userLanguages.userId, userId));
      console.log(`Deleted ${deleteResult?.rowCount || 0} existing languages`);
      
      // Insert new languages
      if (languageIds.length > 0) {
        const insertData = languageIds.map(languageId => ({ userId, languageId }));
        console.log('Inserting language data:', insertData);
        
        const insertResult = await db.insert(userLanguages).values(insertData);
        console.log(`Inserted ${insertResult?.rowCount || languageIds.length} languages`);
      }
    } catch (error) {
      console.error('Error updating user languages:', error);
      throw error;
    }
  }

  async updateUserSkills(userId: string, skillIds: number[]): Promise<void> {
    try {
      console.log(`Updating skills for user ${userId}:`, skillIds);
      
      // Delete existing skills
      const deleteResult = await db.delete(userSkills).where(eq(userSkills.userId, userId));
      console.log(`Deleted ${deleteResult?.rowCount || 0} existing skills`);
      
      // Insert new skills
      if (skillIds.length > 0) {
        const insertData = skillIds.map(skillId => ({ userId, skillId }));
        console.log('Inserting skill data:', insertData);
        
        const insertResult = await db.insert(userSkills).values(insertData);
        console.log(`Inserted ${insertResult?.rowCount || skillIds.length} skills`);
      }
    } catch (error) {
      console.error('Error updating user skills:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
