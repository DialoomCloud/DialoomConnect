import {
  users,
  userAuthProviders,
  mediaContent,
  countries,
  languages,
  skills,
  categories,
  userLanguages,
  userSkills,
  userCategories,
  hostAvailability,
  hostPricing,
  stripePayments,
  invoices,
  adminConfig,
  adminAuditLog,
  bookings,
  emailTemplates,
  emailNotifications,
  userMessages,
  newsArticles,
  socialPlatforms,
  userSocialProfiles,
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
  type HostAvailability,
  type InsertHostAvailability,
  type HostPricing,
  type InsertHostPricing,
  type StripePayment,
  type InsertStripePayment,
  type Invoice,
  type InsertInvoice,
  type AdminConfig,
  type InsertAdminConfig,
  type AdminAuditLog,
  type InsertAdminAuditLog,
  type Booking,
  type InsertBooking,
  type EmailTemplate,
  type InsertEmailTemplate,
  type EmailNotification,
  type InsertEmailNotification,
  type UserMessage,
  type InsertUserMessage,
  type NewsArticle,
  type InsertNewsArticle,
  type CreateNewsArticle,
  type UpdateNewsArticle,
  type SocialPlatform,
  type UserSocialProfile,
  type InsertUserSocialProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc, sql, gte, lte, or } from "drizzle-orm";
import { replitStorage } from "./object-storage";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserComplete(id: string): Promise<User | undefined>; // Get complete user profile without censoring
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  createUserWithPassword(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isAdmin?: boolean;
    isHost?: boolean;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<User>;
  
  // Media content operations
  getUserMediaContent(userId: string): Promise<MediaContent[]>;
  getUserMedia(userId: string): Promise<MediaContent[]>; // Alias for getUserMediaContent
  createMediaContent(content: InsertMediaContent): Promise<MediaContent>;
  updateMediaContent(id: string, content: Partial<InsertMediaContent>): Promise<MediaContent>;
  deleteMediaContent(id: string, userId: string): Promise<boolean>;
  updateMediaOrder(userId: string, mediaIds: string[]): Promise<void>;

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
  
  // Additional user operations
  getAllUsers(): Promise<User[]>;
  getAllUsersForAdmin(): Promise<User[]>;
  updateUserStatus(userId: string, updates: {
    firstName?: string,
    lastName?: string,
    email?: string,
    username?: string,
    role?: string,
    isHost?: boolean,
    isAdmin?: boolean,
    isActive?: boolean,
    isVerified?: boolean
  }): Promise<void>;
  getUserWithPrivateInfo(id: string, requesterId: string): Promise<User | undefined>;
  updateProfileImage(userId: string, imageUrl: string): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserStripeConnect(userId: string, accountId: string, onboardingCompleted: boolean): Promise<User>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;
  
  // Admin and verification operations
  getPendingVerificationUsers(): Promise<User[]>;
  verifyUser(userId: string, isVerified: boolean, verifiedBy: string, notes?: string): Promise<void>;
  
  // GDPR compliance operations
  exportUserData(userId: string): Promise<any>;
  requestDataDeletion(userId: string, deletionDate: Date): Promise<void>;
  
  // OAuth provider operations
  getUserAuthProviders(userId: string): Promise<any[]>;
  linkAuthProvider(userId: string, provider: string, providerUserId: string, email: string): Promise<any>;
  unlinkAuthProvider(userId: string, provider: string): Promise<boolean>;
  getUserByProviderInfo(provider: string, providerUserId: string): Promise<User | undefined>;
  
  // Host availability operations
  getHostAvailability(userId: string): Promise<HostAvailability[]>;
  createHostAvailability(availability: InsertHostAvailability): Promise<HostAvailability>;
  addHostAvailability(availability: InsertHostAvailability): Promise<HostAvailability>;
  updateHostAvailability(id: string, userId: string, updates: any): Promise<any | undefined>;
  deleteHostAvailability(id: string, userId: string): Promise<boolean>;
  
  // Host pricing operations
  getHostPricing(userId: string): Promise<HostPricing[]>;
  createHostPricing(pricing: InsertHostPricing): Promise<HostPricing>;
  upsertHostPricing(pricing: InsertHostPricing): Promise<HostPricing>;
  updateHostPricing(id: string, userId: string, updates: any): Promise<any | undefined>;
  deleteHostPricing(id: string, userId: string): Promise<boolean>;
  
  // Host categories operations
  getHostCategories(userId: string): Promise<any[]>;
  updateHostCategories(userId: string, categoryIds: number[]): Promise<void>;
  
  // Booking operations
  createBooking(booking: any): Promise<any>;
  getBookingById(id: string): Promise<any | undefined>;
  getBooking(id: string): Promise<Booking | undefined>; // Alias for getBookingById
  getHostBookings(hostId: string): Promise<any[]>;
  getGuestBookings(guestId: string): Promise<any[]>;
  updateBooking(id: string, updates: any): Promise<any | undefined>;
  updateBookingStatus(id: string, status: string): Promise<void>;
  cancelBooking(id: string, userId: string): Promise<boolean>;
  getBookingsByDate(hostId: string, date: string): Promise<any[]>;
  
  // Host search operations
  searchHosts(filters?: { categoryIds?: number[]; minPrice?: number; maxPrice?: number }): Promise<User[]>;
  
  // Stripe payment operations
  createStripePayment(payment: InsertStripePayment): Promise<StripePayment>;
  getStripePayment(id: string): Promise<StripePayment | undefined>;
  getStripePaymentByIntent(stripePaymentIntentId: string): Promise<StripePayment | undefined>;
  updateStripePaymentStatus(id: string, status: string): Promise<StripePayment>;
  getHostPayments(hostId: string): Promise<StripePayment[]>;
  getGuestPayments(guestId: string): Promise<StripePayment[]>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getUserInvoices(userId: string): Promise<Invoice[]>;
  updateInvoiceDownload(id: string): Promise<Invoice>;
  generateNextInvoiceNumber(): Promise<string>;
  
  // Admin configuration operations
  getAdminConfig(key: string): Promise<AdminConfig | undefined>;
  getAllAdminConfig(): Promise<AdminConfig[]>;
  updateAdminConfig(key: string, value: string, updatedBy: string, description?: string): Promise<AdminConfig>;
  
  // Admin audit log operations
  createAuditLog(log: InsertAdminAuditLog): Promise<AdminAuditLog>;
  getAuditLogs(limit?: number): Promise<AdminAuditLog[]>;
  
  // Commission and pricing calculations
  calculateCommission(amount: number): Promise<{ commission: number; vat: number; hostAmount: number }>;
  getServicePricing(): Promise<{ screenSharing: number; translation: number; recording: number; transcription: number }>;
  
  // Admin Dashboard Statistics
  getTotalHosts(): Promise<number>;
  getNewHostsThisMonth(): Promise<number>;
  getTotalVideoCalls(): Promise<number>;
  getCallsToday(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;
  getRevenueGrowth(): Promise<number>;
  getAverageCallDuration(): Promise<number>;
  getAllHosts(): Promise<User[]>;
  getAdminConfigObject(): Promise<any>;
  getAdminConfig(key: string): Promise<AdminConfig | undefined>;
  getAllAdminConfig(): Promise<AdminConfig[]>;
  updateAdminConfig(key: string, value: string, updatedBy: string, description?: string): Promise<AdminConfig>;
  updateMultipleAdminConfigs(config: any, userId: string): Promise<any>;

  // Email system operations
  getEmailTemplate(type: string): Promise<EmailTemplate | null>;
  getEmailTemplateById(id: string): Promise<EmailTemplate | undefined>;
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<boolean>;
  
  createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification>;
  updateEmailNotification(id: string, updates: Partial<InsertEmailNotification>): Promise<EmailNotification>;
  getEmailNotifications(userId?: string, limit?: number): Promise<EmailNotification[]>;
  getEmailNotificationsByResendId(resendId: string): Promise<EmailNotification[]>;
  
  createUserMessage(message: InsertUserMessage): Promise<UserMessage>;
  getUserMessages(recipientId: string, isRead?: boolean): Promise<UserMessage[]>;
  markMessageAsRead(id: string): Promise<UserMessage>;
  
  // News articles operations
  getAllNewsArticles(status?: string): Promise<NewsArticle[]>;
  getPublishedNewsArticles(limit?: number): Promise<NewsArticle[]>;
  getFeaturedNewsArticles(limit?: number): Promise<NewsArticle[]>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: CreateNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, updates: UpdateNewsArticle): Promise<NewsArticle>;
  deleteNewsArticle(id: string): Promise<boolean>;
  incrementArticleViews(id: string): Promise<void>;
  publishNewsArticle(id: string): Promise<NewsArticle>;
  generateSlugFromTitle(title: string): Promise<string>;

  // Social platforms operations
  getSocialPlatforms(): Promise<any[]>;
  
  // User social profiles operations  
  getUserSocialProfiles(userId: string): Promise<any[]>;
  updateUserSocialProfiles(userId: string, profiles: {platformId: number, username: string}[]): Promise<void>;
  
  // User categories operations
  getUserCategories(userId: string): Promise<any[]>;
  updateUserCategories(userId: string, categoryIds: number[]): Promise<void>;
  
  // User profile operations (for admin complete editing)

  updateUserSkills(userId: string, skillIds: number[]): Promise<void>;
  updateUserLanguages(userId: string, languageIds: number[]): Promise<void>;

  // Skills by name operations
  getSkillByName(name: string): Promise<any | undefined>;
  createSkill(skill: any): Promise<any>;
  addUserSkill(userId: string, skillId: number): Promise<void>;

  // Categories by name operations
  getCategoryByName(name: string): Promise<any | undefined>;
  createCategory(category: any): Promise<any>;
  addUserCategory(userId: string, categoryId: number): Promise<void>;
  
  // Host verification document operations
  getHostVerificationDocuments(userId: string): Promise<any[]>;
  createHostVerificationDocument(document: any): Promise<any>;
  updateHostVerificationDocument(id: string, updates: any): Promise<any>;
  deleteHostVerificationDocument(id: string): Promise<boolean>;
  getPendingHostVerifications(): Promise<any[]>;
  approveHostVerification(userId: string, adminId: string): Promise<void>;
  rejectHostVerification(userId: string, adminId: string, reason: string): Promise<void>;
  
  // Host verification flow operations
  requestHostStatus(userId: string): Promise<string>;
  activateHostAccount(userId: string, token: string): Promise<boolean>;
  generateHostActivationToken(userId: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      // Hide private information for non-admin users
      return {
        ...user,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        passwordHash: null,
      };
    }
    return user;
  }

  // Get complete user profile (for own profile access)
  async getUserComplete(id: string): Promise<User | undefined> {
    console.log('🔍 [STORAGE] Getting complete user profile for:', id);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      console.log('✅ [STORAGE] Found complete user profile:', {
        id: user.id,
        address: user.address,
        phone: user.phone,
        city: user.city,
        postalCode: user.postalCode,
        title: user.title,
        description: user.description
      });
      // Return complete profile without censoring personal information  
      return {
        ...user,
        passwordHash: null, // Only hide password hash for security
      };
    }
    console.log('❌ [STORAGE] User not found:', id);
    return user;
  }

  async getUserWithPrivateInfo(id: string, requesterId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    const [requester] = await db.select().from(users).where(eq(users.id, requesterId));
    
    if (user && (user.id === requesterId || requester?.isAdmin)) {
      // Show all information if it's the owner or an admin
      return user;
    } else if (user) {
      // Hide private information for other users
      return {
        ...user,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        passwordHash: null,
      };
    }
    return user;
  }

  async updateProfileImage(userId: string, imageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        profileImageUrl: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin and verification operations
  async getPendingVerificationUsers(): Promise<User[]> {
    const pendingUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.isVerified, false), eq(users.isActive, true)));
    return pendingUsers;
  }

  async verifyUser(userId: string, isVerified: boolean, verifiedBy: string, notes?: string): Promise<void> {
    await db
      .update(users)
      .set({
        isVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // GDPR compliance operations
  async exportUserData(userId: string): Promise<any> {
    const user = await db.select().from(users).where(eq(users.id, userId));
    const userLanguagesData = await db.select().from(userLanguages).where(eq(userLanguages.userId, userId));
    const userSkillsData = await db.select().from(userSkills).where(eq(userSkills.userId, userId));
    const mediaContentData = await db.select().from(mediaContent).where(eq(mediaContent.userId, userId));

    return {
      profile: user[0],
      languages: userLanguagesData,
      skills: userSkillsData,
      media: mediaContentData,
      exportDate: new Date().toISOString()
    };
  }

  async requestDataDeletion(userId: string, deletionDate: Date): Promise<void> {
    await db
      .update(users)
      .set({
        dataRetentionDate: deletionDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).where(eq(users.isActive, true));
    // Return users with private info hidden
    return allUsers.map(user => ({
      ...user,
      phone: null,
      address: null,
      city: null,
      postalCode: null,
      passwordHash: null,
    }));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsersForAdmin(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    // Return all user data for admin
    return allUsers;
  }

  async updateUserStatus(userId: string, updates: { 
    firstName?: string, 
    lastName?: string, 
    email?: string, 
    username?: string, 
    role?: string, 
    isHost?: boolean, 
    isAdmin?: boolean, 
    isActive?: boolean, 
    isVerified?: boolean 
  }): Promise<void> {
    const updateData: any = { updatedAt: new Date() };
    
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.isHost !== undefined) updateData.isHost = updates.isHost;
    if (updates.isAdmin !== undefined) updateData.isAdmin = updates.isAdmin;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.isVerified !== undefined) updateData.isVerified = updates.isVerified;
    
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }

  async upsertUser(userData: UpsertUser & { provider?: string; providerUserId?: string }): Promise<User> {
    // 1. Busca si ya existe un usuario con ese email en tu base de datos Neon
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser) {
      // 2. SI EXISTE: No actualices su perfil. Simplemente devuelve el usuario que ya tienes.
      console.log(`Usuario existente ${userData.email} encontrado. Omitiendo actualización de perfil desde Supabase.`);
      
      // Asegúrate de que el proveedor de OAuth esté vinculado si es necesario
      if (userData.provider && userData.providerUserId) {
        await this.linkAuthProvider(existingUser.id, userData.provider, userData.providerUserId, userData.email);
      }
      
      return existingUser;
    } else {
      // 3. SI NO EXISTE: Créalo por primera vez con los datos de Supabase.
      console.log(`Creando nuevo usuario para ${userData.email} con datos de Supabase.`);
      const [newUser] = await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          // Asegúrate de que los campos obligatorios tengan valores por defecto
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Vincula el proveedor de OAuth al nuevo usuario
      if (userData.provider && userData.providerUserId) {
        await this.linkAuthProvider(newUser.id, userData.provider, userData.providerUserId, userData.email);
      }
      
      return newUser;
    }
  }

  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User> {
    console.log('[updateUserProfile] Updating user', id, 'with data:', profile);
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Map all the fields explicitly to ensure they reach the database
    if (profile.firstName !== undefined) updateData.firstName = profile.firstName;
    if (profile.lastName !== undefined) updateData.lastName = profile.lastName;
    if (profile.dateOfBirth !== undefined) updateData.dateOfBirth = profile.dateOfBirth;
    if (profile.nationality !== undefined) updateData.nationality = profile.nationality;
    if (profile.countryCode !== undefined) updateData.countryCode = profile.countryCode;
    if (profile.title !== undefined) updateData.title = profile.title;
    if (profile.description !== undefined) updateData.description = profile.description;
    if (profile.address !== undefined) updateData.address = profile.address;
    if (profile.city !== undefined) updateData.city = profile.city;
    if (profile.postalCode !== undefined) updateData.postalCode = profile.postalCode;
    if (profile.primaryLanguageId !== undefined) updateData.primaryLanguageId = profile.primaryLanguageId;
    if (profile.phone !== undefined) updateData.phone = profile.phone;

    console.log('[updateUserProfile] Final update data:', updateData);

    // Execute the update
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id));
    
    // Fetch the complete updated user (Drizzle .returning() has issues with PostgreSQL)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    console.log('[updateUserProfile] Successfully updated user', id, ', complete result:', user);
    
    return user;
  }

  async updateUserStripeConnect(userId: string, accountId: string, onboardingCompleted: boolean): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ 
        stripeAccountId: accountId,
        stripeOnboardingCompleted: onboardingCompleted,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Media content operations
  async getUserMediaContent(userId: string): Promise<MediaContent[]> {
    return await db
      .select()
      .from(mediaContent)
      .where(eq(mediaContent.userId, userId))
      .orderBy(asc(mediaContent.displayOrder));
  }

  // Alias for getUserMediaContent
  async getUserMedia(userId: string): Promise<MediaContent[]> {
    return this.getUserMediaContent(userId);
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
    // First get the media content to get the file URL
    const content = await db
      .select()
      .from(mediaContent)
      .where(and(eq(mediaContent.id, id), eq(mediaContent.userId, userId)))
      .limit(1);
    
    if (content.length === 0) {
      return false;
    }
    
    // Delete from database
    const result = await db
      .delete(mediaContent)
      .where(and(eq(mediaContent.id, id), eq(mediaContent.userId, userId)));
    
    // If deletion was successful and content has a URL (local file), delete from object storage
    if ((result?.rowCount || 0) > 0 && content[0].url && content[0].type !== 'youtube') {
      try {
        const objectStorage = new ReplitObjectStorage();
        await objectStorage.deleteObject(content[0].url);
        console.log(`Deleted file from object storage: ${content[0].url}`);
      } catch (error) {
        console.error(`Failed to delete file from object storage: ${content[0].url}`, error);
        // Continue even if file deletion fails
      }
    }
    
    return (result?.rowCount || 0) > 0;
  }

  async updateMediaOrder(userId: string, mediaIds: string[]): Promise<void> {
    // Update the display order for each media item
    for (let i = 0; i < mediaIds.length; i++) {
      await db
        .update(mediaContent)
        .set({ displayOrder: i })
        .where(and(
          eq(mediaContent.id, mediaIds[i]),
          eq(mediaContent.userId, userId)
        ));
    }
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

  async getSkillByName(name: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.name, name));
    return skill;
  }

  async createSkill(skillData: any): Promise<Skill> {
    const [skill] = await db.insert(skills).values(skillData).returning();
    return skill;
  }

  async addUserCategory(userId: string, categoryId: number): Promise<void> {
    // Check if relationship already exists
    const existing = await db.select()
      .from(userCategories)
      .where(and(eq(userCategories.userId, userId), eq(userCategories.categoryId, categoryId)));
    
    if (existing.length === 0) {
      await db.insert(userCategories).values({ userId, categoryId });
    }
  }

  async addUserSkill(userId: string, skillId: number): Promise<void> {
    // Check if relationship already exists
    const existing = await db.select()
      .from(userSkills)
      .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));
    
    if (existing.length === 0) {
      await db.insert(userSkills).values({ userId, skillId });
    }
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }

  async createCategory(categoryData: any): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
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
  // Host availability operations
  async getHostAvailability(userId: string): Promise<HostAvailability[]> {
    return await db.select().from(hostAvailability).where(eq(hostAvailability.userId, userId));
  }

  async createHostAvailability(availability: InsertHostAvailability): Promise<HostAvailability> {
    const [result] = await db.insert(hostAvailability).values(availability).returning();
    return result;
  }

  async addHostAvailability(availability: InsertHostAvailability): Promise<HostAvailability> {
    return this.createHostAvailability(availability);
  }

  async updateHostAvailability(id: string, userId: string, updates: any): Promise<any | undefined> {
    const { hostAvailability } = await import("@shared/schema");
    const [result] = await db
      .update(hostAvailability)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(hostAvailability.id, id), eq(hostAvailability.userId, userId)))
      .returning();
    return result;
  }

  async deleteHostAvailability(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(hostAvailability)
      .where(and(eq(hostAvailability.id, id), eq(hostAvailability.userId, userId)));
    return (result?.rowCount || 0) > 0;
  }

  // Host pricing operations
  async getHostPricing(userId: string): Promise<HostPricing[]> {
    return await db.select().from(hostPricing).where(eq(hostPricing.userId, userId));
  }

  async createHostPricing(pricing: InsertHostPricing): Promise<HostPricing> {
    const [result] = await db.insert(hostPricing).values(pricing).returning();
    return result;
  }

  async upsertHostPricing(pricing: InsertHostPricing): Promise<HostPricing> {
    const existing = await db
      .select()
      .from(hostPricing)
      .where(and(
        eq(hostPricing.userId, pricing.userId),
        eq(hostPricing.duration, pricing.duration)
      ));

    if (existing.length > 0) {
      // Update existing pricing
      const [result] = await db
        .update(hostPricing)
        .set({ ...pricing, updatedAt: new Date() })
        .where(eq(hostPricing.id, existing[0].id))
        .returning();
      return result;
    } else {
      // Create new pricing
      return this.createHostPricing(pricing);
    }
  }

  async updateHostPricing(id: string, userId: string, updates: any): Promise<any | undefined> {
    const { hostPricing } = await import("@shared/schema");
    const [result] = await db
      .update(hostPricing)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(hostPricing.id, id), eq(hostPricing.userId, userId)))
      .returning();
    return result;
  }

  async deleteHostPricing(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(hostPricing)
      .where(and(eq(hostPricing.id, id), eq(hostPricing.userId, userId)));
    return (result?.rowCount || 0) > 0;
  }

  // Host categories operations
  async getHostCategories(userId: string): Promise<any[]> {
    const { hostCategories } = await import("@shared/schema");
    return await db.select().from(hostCategories).where(eq(hostCategories.userId, userId));
  }

  async updateHostCategories(userId: string, categoryIds: number[]): Promise<void> {
    const { hostCategories } = await import("@shared/schema");
    
    // Delete existing categories
    await db.delete(hostCategories).where(eq(hostCategories.userId, userId));
    
    // Insert new categories
    if (categoryIds.length > 0) {
      await db.insert(hostCategories).values(
        categoryIds.map(categoryId => ({ userId, categoryId }))
      );
    }
  }

  // Booking operations
  async createBooking(booking: any): Promise<any> {
    const { bookings } = await import("@shared/schema");
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async getBookingById(id: string): Promise<any | undefined> {
    const { bookings } = await import("@shared/schema");
    const [result] = await db.select().from(bookings).where(eq(bookings.id, id));
    return result;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.getBookingById(id);
  }

  async getHostBookings(hostId: string): Promise<any[]> {
    const { bookings } = await import("@shared/schema");
    return await db.select().from(bookings).where(eq(bookings.hostId, hostId));
  }

  async getGuestBookings(guestId: string): Promise<any[]> {
    const { bookings } = await import("@shared/schema");
    return await db.select().from(bookings).where(eq(bookings.guestId, guestId));
  }

  async updateBooking(id: string, updates: any): Promise<any | undefined> {
    const { bookings } = await import("@shared/schema");
    const [result] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return result;
  }

  async cancelBooking(id: string, userId: string): Promise<boolean> {
    const { bookings } = await import("@shared/schema");
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    
    if (!booking || (booking.hostId !== userId && booking.guestId !== userId)) {
      return false;
    }
    
    const result = await db
      .update(bookings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(bookings.id, id));
    
    return (result?.rowCount || 0) > 0;
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const { bookings } = await import("@shared/schema");
    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  async getBookingsByDate(hostId: string, date: string): Promise<any[]> {
    const { bookings } = await import("@shared/schema");
    return await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.hostId, hostId), eq(bookings.scheduledDate, date)));
  }

  // Host search operations
  async searchHosts(filters?: { categoryIds?: number[]; minPrice?: number; maxPrice?: number }): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.isActive, true));
    
    // Add additional filtering logic here if needed
    
    const results = await query;
    
    // Return users with private info hidden
    return results.map(user => ({
      ...user,
      phone: null,
      address: null,
      city: null,
      postalCode: null,
      passwordHash: null,
    }));
  }

  // Stripe payment operations
  async createStripePayment(payment: InsertStripePayment): Promise<StripePayment> {
    const [result] = await db.insert(stripePayments).values(payment).returning();
    return result;
  }

  async getStripePayment(id: string): Promise<StripePayment | undefined> {
    const [payment] = await db.select().from(stripePayments).where(eq(stripePayments.id, id));
    return payment;
  }

  async getStripePaymentByIntent(stripePaymentIntentId: string): Promise<StripePayment | undefined> {
    const [payment] = await db.select().from(stripePayments).where(eq(stripePayments.stripePaymentIntentId, stripePaymentIntentId));
    return payment;
  }

  async updateStripePaymentStatus(id: string, status: string): Promise<StripePayment> {
    const [payment] = await db
      .update(stripePayments)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(stripePayments.id, id))
      .returning();
    return payment;
  }

  async getHostPayments(hostId: string): Promise<StripePayment[]> {
    return await db
      .select({
        ...stripePayments,
        booking: bookings,
      })
      .from(stripePayments)
      .leftJoin(bookings, eq(stripePayments.bookingId, bookings.id))
      .where(eq(bookings.hostId, hostId))
      .orderBy(desc(stripePayments.createdAt));
  }

  async getGuestPayments(guestId: string): Promise<StripePayment[]> {
    return await db
      .select({
        ...stripePayments,
        booking: bookings,
      })
      .from(stripePayments)
      .leftJoin(bookings, eq(stripePayments.bookingId, bookings.id))
      .where(eq(bookings.guestId, guestId))
      .orderBy(desc(stripePayments.createdAt));
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [result] = await db.insert(invoices).values(invoice).returning();
    return result;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  async updateInvoiceDownload(id: string): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ 
        isDownloaded: true, 
        downloadCount: sql`${invoices.downloadCount} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async generateNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const yearPrefix = `DIAL-${year}-`;
    
    // Get the highest invoice number for this year
    const lastInvoice = await db
      .select()
      .from(invoices)
      .where(sql`${invoices.invoiceNumber} LIKE ${yearPrefix + '%'}`)
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1);

    if (lastInvoice.length === 0) {
      return `${yearPrefix}00001`;
    }

    const lastNumber = parseInt(lastInvoice[0].invoiceNumber.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
    return `${yearPrefix}${nextNumber}`;
  }

  // Admin configuration operations
  async getAdminConfig(key: string): Promise<AdminConfig | undefined> {
    const [config] = await db.select().from(adminConfig).where(eq(adminConfig.key, key));
    return config;
  }

  async getAllAdminConfig(): Promise<AdminConfig[]> {
    return await db.select().from(adminConfig).orderBy(asc(adminConfig.key));
  }

  async updateAdminConfig(key: string, value: string, updatedBy: string, description?: string): Promise<AdminConfig> {
    const existing = await this.getAdminConfig(key);
    
    if (existing) {
      const [updated] = await db
        .update(adminConfig)
        .set({ 
          value, 
          description: description || existing.description,
          updatedBy,
          updatedAt: new Date() 
        })
        .where(eq(adminConfig.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminConfig)
        .values({ key, value, description, updatedBy })
        .returning();
      return created;
    }
  }

  // Admin audit log operations
  async createAuditLog(log: InsertAdminAuditLog): Promise<AdminAuditLog> {
    const [result] = await db.insert(adminAuditLog).values(log).returning();
    return result;
  }

  async getAuditLogs(limit: number = 100): Promise<AdminAuditLog[]> {
    return await db
      .select()
      .from(adminAuditLog)
      .orderBy(desc(adminAuditLog.createdAt))
      .limit(limit);
  }

  // Commission and pricing calculations
  async calculateCommission(amount: number): Promise<{ commission: number; vat: number; hostAmount: number }> {
    const commissionConfig = await this.getAdminConfig('commission_rate');
    const vatConfig = await this.getAdminConfig('vat_rate');
    
    const commissionRate = commissionConfig ? parseFloat(commissionConfig.value) : 0.10; // Default 10%
    const vatRate = vatConfig ? parseFloat(vatConfig.value) : 0.21; // Default 21% EU VAT
    
    const commission = amount * commissionRate;
    const vat = commission * vatRate;
    const hostAmount = amount - commission - vat;
    
    return {
      commission: Math.round(commission * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      hostAmount: Math.round(hostAmount * 100) / 100,
    };
  }

  async getServicePricing(): Promise<{ screenSharing: number; translation: number; recording: number; transcription: number }> {
    const configs = await Promise.all([
      this.getAdminConfig('screen_sharing_price'),
      this.getAdminConfig('translation_price'), 
      this.getAdminConfig('recording_price'),
      this.getAdminConfig('transcription_price'),
    ]);

    return {
      screenSharing: configs[0] ? parseFloat(configs[0].value) : 5.0,
      translation: configs[1] ? parseFloat(configs[1].value) : 10.0,
      recording: configs[2] ? parseFloat(configs[2].value) : 8.0,
      transcription: configs[3] ? parseFloat(configs[3].value) : 12.0,
    };
  }

  // Admin Dashboard Statistics
  async getTotalHosts(): Promise<number> {
    const result = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.isActive, true));
    return result.length;
  }

  async getNewHostsThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ count: users.id })
      .from(users)
      .where(and(
        eq(users.isActive, true),
        eq(users.createdAt >= startOfMonth, true)
      ));
    return result.length;
  }

  async getTotalVideoCalls(): Promise<number> {
    const result = await db
      .select({ count: bookings.id })
      .from(bookings)
      .where(eq(bookings.status, 'completed'));
    return result.length;
  }

  async getCallsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ count: bookings.id })
      .from(bookings)
      .where(and(
        eq(bookings.status, 'completed'),
        eq(bookings.date >= today.toISOString(), true)
      ));
    return result.length;
  }

  async getMonthlyRevenue(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const payments = await db
      .select({ amount: stripePayments.amount })
      .from(stripePayments)
      .where(and(
        eq(stripePayments.status, 'succeeded'),
        eq(stripePayments.createdAt >= startOfMonth, true)
      ));
    
    return payments.reduce((sum, payment) => sum + payment.amount, 0) / 100; // Convert cents to euros
  }

  async getRevenueGrowth(): Promise<number> {
    const thisMonth = await this.getMonthlyRevenue();
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    
    const endOfLastMonth = new Date(lastMonth);
    endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1);
    endOfLastMonth.setDate(0);
    
    const lastMonthPayments = await db
      .select({ amount: stripePayments.amount })
      .from(stripePayments)
      .where(and(
        eq(stripePayments.status, 'succeeded'),
        and(
          eq(stripePayments.createdAt >= lastMonth, true),
          eq(stripePayments.createdAt <= endOfLastMonth, true)
        )
      ));
    
    const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) => sum + payment.amount, 0) / 100;
    
    if (lastMonthRevenue === 0) return 0;
    return Math.round(((thisMonth - lastMonthRevenue) / lastMonthRevenue) * 100);
  }

  async getAverageCallDuration(): Promise<number> {
    const completedBookings = await db
      .select({ duration: bookings.duration })
      .from(bookings)
      .where(eq(bookings.status, 'completed'));
    
    if (completedBookings.length === 0) return 0;
    
    const totalDuration = completedBookings.reduce((sum, booking) => sum + (booking.duration || 0), 0);
    return Math.round(totalDuration / completedBookings.length);
  }

  async getAllHosts(): Promise<User[]> {
    const hosts = await db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(desc(users.createdAt));
    
    // Return with private info for admin
    return hosts;
  }

  async getAdminConfigObject(): Promise<any> {
    const configs = await this.getAllAdminConfig();
    const configMap: any = {};
    
    configs.forEach(config => {
      configMap[config.key] = config.value;
    });
    
    return {
      commission: parseFloat(configMap.commission_rate || '10'),
      vatRate: parseFloat(configMap.vat_rate || '21'),
      screenSharePrice: parseFloat(configMap.screen_sharing_price || '10'),
      translationPrice: parseFloat(configMap.translation_price || '25'),
      recordingPrice: parseFloat(configMap.recording_price || '10'),
      transcriptionPrice: parseFloat(configMap.transcription_price || '5'),
    };
  }

  async updateMultipleAdminConfigs(config: any, userId: string): Promise<any> {
    const updates = [
      { key: 'commission_rate', value: config.commission?.toString() || '10' },
      { key: 'vat_rate', value: config.vatRate?.toString() || '21' },
      { key: 'screen_sharing_price', value: config.screenSharePrice?.toString() || '10' },
      { key: 'translation_price', value: config.translationPrice?.toString() || '25' },
      { key: 'recording_price', value: config.recordingPrice?.toString() || '10' },
      { key: 'transcription_price', value: config.transcriptionPrice?.toString() || '5' },
    ];

    for (const update of updates) {
      await this.updateAdminConfig(update.key, update.value, userId);
    }

    return this.getAdminConfigObject();
  }

  // Email system operations
  async getEmailTemplate(type: string): Promise<EmailTemplate | null> {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(and(
        eq(emailTemplates.type, type as any),
        eq(emailTemplates.isActive, true)
      ))
      .orderBy(desc(emailTemplates.isDefault), desc(emailTemplates.createdAt));
    
    return template || null;
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(emailTemplates.type, emailTemplates.name);
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: string, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [updated] = await db
      .update(emailTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return result.rowCount > 0;
  }

  async createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification> {
    const [newNotification] = await db.insert(emailNotifications).values(notification).returning();
    return newNotification;
  }

  async updateEmailNotification(id: string, updates: Partial<InsertEmailNotification>): Promise<EmailNotification> {
    const [updated] = await db
      .update(emailNotifications)
      .set(updates)
      .where(eq(emailNotifications.id, id))
      .returning();
    return updated;
  }

  async getEmailNotifications(userId?: string, limit: number = 50): Promise<EmailNotification[]> {
    const query = db.select().from(emailNotifications);
    
    if (userId) {
      query.where(eq(emailNotifications.userId, userId));
    }
    
    return await query.orderBy(desc(emailNotifications.createdAt)).limit(limit);
  }

  async getEmailNotificationsByResendId(resendId: string): Promise<EmailNotification[]> {
    // For now, we'll search by email ID in the status field or return empty array
    // In the future, we should add a resendId column to the emailNotifications table
    return [];
  }

  async createUserMessage(message: InsertUserMessage): Promise<UserMessage> {
    const [newMessage] = await db.insert(userMessages).values(message).returning();
    return newMessage;
  }

  async getUserMessages(recipientId: string, isRead?: boolean): Promise<UserMessage[]> {
    const query = db.select().from(userMessages).where(eq(userMessages.recipientId, recipientId));
    
    if (typeof isRead === 'boolean') {
      query.where(and(
        eq(userMessages.recipientId, recipientId),
        eq(userMessages.isRead, isRead)
      ));
    }
    
    return await query.orderBy(desc(userMessages.createdAt));
  }

  async markMessageAsRead(id: string): Promise<UserMessage> {
    const [updated] = await db
      .update(userMessages)
      .set({ isRead: true })
      .where(eq(userMessages.id, id))
      .returning();
    return updated;
  }

  // News articles operations
  async getAllNewsArticles(status?: string): Promise<NewsArticle[]> {
    const query = db.select().from(newsArticles);
    
    if (status) {
      query.where(eq(newsArticles.status, status as any));
    }
    
    return await query.orderBy(desc(newsArticles.createdAt));
  }

  async getPublishedNewsArticles(limit: number = 10): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.status, 'published'))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getFeaturedNewsArticles(limit: number = 5): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .where(and(
        eq(newsArticles.status, 'published'),
        eq(newsArticles.isFeatured, true)
      ))
      .orderBy(asc(newsArticles.displayOrder), desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.slug, slug));
    return article;
  }

  async createNewsArticle(article: CreateNewsArticle): Promise<NewsArticle> {
    const slug = await this.generateSlugFromTitle(article.title);
    const articleData = {
      ...article,
      slug,
      publishedAt: article.status === 'published' ? new Date() : null,
    };
    
    const [newArticle] = await db.insert(newsArticles).values(articleData).returning();
    return newArticle;
  }

  async updateNewsArticle(id: string, updates: UpdateNewsArticle): Promise<NewsArticle> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    // Generate new slug if title is being updated
    if (updates.title) {
      updateData.slug = await this.generateSlugFromTitle(updates.title);
    }
    
    // Set publishedAt if status is being changed to published
    if (updates.status === 'published') {
      const existing = await this.getNewsArticle(id);
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    const [updated] = await db
      .update(newsArticles)
      .set(updateData)
      .where(eq(newsArticles.id, id))
      .returning();
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    const result = await db.delete(newsArticles).where(eq(newsArticles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async incrementArticleViews(id: string): Promise<void> {
    await db
      .update(newsArticles)
      .set({ viewCount: sql`${newsArticles.viewCount} + 1` })
      .where(eq(newsArticles.id, id));
  }

  async publishNewsArticle(id: string): Promise<NewsArticle> {
    const [updated] = await db
      .update(newsArticles)
      .set({ 
        status: 'published', 
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(newsArticles.id, id))
      .returning();
    return updated;
  }

  async generateSlugFromTitle(title: string): Promise<string> {
    // Generate base slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check for duplicates and add number suffix if needed
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await this.getNewsArticleBySlug(slug);
      if (!existing) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  // Social platforms operations
  async getSocialPlatforms(): Promise<SocialPlatform[]> {
    return await db.select().from(socialPlatforms).where(eq(socialPlatforms.isActive, true)).orderBy(socialPlatforms.displayOrder);
  }

  // User social profiles operations
  async getUserSocialProfiles(userId: string): Promise<UserSocialProfile[]> {
    return await db.select().from(userSocialProfiles).where(eq(userSocialProfiles.userId, userId));
  }

  async updateUserSocialProfiles(userId: string, profiles: {platformId: number, username: string}[]): Promise<void> {
    // Delete existing social profiles
    await db.delete(userSocialProfiles).where(eq(userSocialProfiles.userId, userId));
    
    // Insert new social profiles
    if (profiles.length > 0) {
      await db.insert(userSocialProfiles).values(
        profiles.map(profile => ({
          userId,
          platformId: profile.platformId,
          username: profile.username,
          url: `https://example.com/${profile.username}`, // This should be constructed based on platform
          isVisible: true
        }))
      );
    }
  }

  // User categories operations
  async getUserCategories(userId: string): Promise<{ categoryId: number }[]> {
    return await db.select({ categoryId: userCategories.categoryId }).from(userCategories).where(eq(userCategories.userId, userId));
  }

  async updateUserCategories(userId: string, categoryIds: number[]): Promise<void> {
    // Delete existing categories
    await db.delete(userCategories).where(eq(userCategories.userId, userId));
    
    // Insert new categories
    if (categoryIds.length > 0) {
      await db.insert(userCategories).values(
        categoryIds.map(categoryId => ({
          userId,
          categoryId
        }))
      );
    }
  }

  // User profile operations (for admin complete editing)


  async updateUserSkills(userId: string, skillIds: number[]): Promise<void> {
    // Delete existing skills
    await db.delete(userSkills).where(eq(userSkills.userId, userId));
    
    // Insert new skills
    if (skillIds.length > 0) {
      await db.insert(userSkills).values(
        skillIds.map(skillId => ({
          userId,
          skillId
        }))
      );
    }
  }

  async updateUserLanguages(userId: string, languageIds: number[]): Promise<void> {
    // Delete existing languages
    await db.delete(userLanguages).where(eq(userLanguages.userId, userId));
    
    // Insert new languages
    if (languageIds.length > 0) {
      await db.insert(userLanguages).values(
        languageIds.map(languageId => ({
          userId,
          languageId
        }))
      );
    }
  }

  // Host verification document operations
  async getHostVerificationDocuments(userId: string): Promise<any[]> {
    const { hostVerificationDocuments } = await import("@shared/schema");
    return await db.select().from(hostVerificationDocuments).where(eq(hostVerificationDocuments.userId, userId));
  }

  async createHostVerificationDocument(document: any): Promise<any> {
    const { hostVerificationDocuments } = await import("@shared/schema");
    const [newDoc] = await db.insert(hostVerificationDocuments).values(document).returning();
    return newDoc;
  }

  async updateHostVerificationDocument(id: string, updates: any): Promise<any> {
    const { hostVerificationDocuments } = await import("@shared/schema");
    const [updated] = await db.update(hostVerificationDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hostVerificationDocuments.id, id))
      .returning();
    return updated;
  }

  async deleteHostVerificationDocument(id: string): Promise<boolean> {
    const { hostVerificationDocuments } = await import("@shared/schema");
    const result = await db.delete(hostVerificationDocuments).where(eq(hostVerificationDocuments.id, id));
    return result.rowCount > 0;
  }

  async getPendingHostVerifications(): Promise<any[]> {
    return await db.select()
      .from(users)
      .where(and(
        eq(users.hostVerificationStatus, 'registered'),
        eq(users.isActive, true)
      ));
  }

  async approveHostVerification(userId: string, adminId: string): Promise<void> {
    const { hostVerificationDocuments } = await import("@shared/schema");
    
    // Update user to be a host
    await db.update(users)
      .set({
        isHost: true,
        role: 'host',
        hostVerificationStatus: 'verified',
        hostVerificationDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
      
    // Update all their verification documents as approved
    await db.update(hostVerificationDocuments)
      .set({
        verificationStatus: 'approved',
        verifiedBy: adminId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(hostVerificationDocuments.userId, userId));
  }

  async rejectHostVerification(userId: string, adminId: string, reason: string): Promise<void> {
    const { hostVerificationDocuments } = await import("@shared/schema");
    
    // Update user status
    await db.update(users)
      .set({
        hostVerificationStatus: 'rejected',
        hostRejectionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
      
    // Update all their verification documents as rejected
    await db.update(hostVerificationDocuments)
      .set({
        verificationStatus: 'rejected',
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(hostVerificationDocuments.userId, userId));
  }

  // Host verification flow operations
  async requestHostStatus(userId: string): Promise<string> {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24 hour expiry
    
    await db.update(users)
      .set({
        hostVerificationStatus: 'registered',
        hostActivationToken: token,
        hostActivationTokenExpiry: expiry,
        hostRequestedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
      
    return token;
  }

  async activateHostAccount(userId: string, token: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.hostActivationToken, token)
      ));
      
    if (!user || !user.hostActivationTokenExpiry || user.hostActivationTokenExpiry < new Date()) {
      return false;
    }
    
    await db.update(users)
      .set({
        hostVerificationStatus: 'active',
        hostActivationToken: null,
        hostActivationTokenExpiry: null,
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
      
    return true;
  }

  async generateHostActivationToken(userId: string): Promise<string> {
    return this.requestHostStatus(userId);
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete user and all related data (cascade delete should handle related records)
      const result = await db.delete(users).where(eq(users.id, id));
      return (result?.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async createUserWithPassword(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isAdmin?: boolean;
    isHost?: boolean;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<User> {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const [newUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash,
      isAdmin: userData.isAdmin || false,
      isHost: userData.isHost || false,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isVerified: userData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return newUser;
  }

  // OAuth provider operations
  async getUserAuthProviders(userId: string): Promise<any[]> {
    return await db.select().from(userAuthProviders).where(eq(userAuthProviders.userId, userId));
  }

  async linkAuthProvider(userId: string, provider: string, providerUserId: string, email: string): Promise<any> {
    const [newProvider] = await db.insert(userAuthProviders).values({
      userId,
      provider: provider as any,
      providerUserId,
      email,
      linkedAt: new Date(),
      lastUsedAt: new Date()
    }).returning();
    return newProvider;
  }

  async unlinkAuthProvider(userId: string, provider: string): Promise<boolean> {
    const result = await db.delete(userAuthProviders)
      .where(and(
        eq(userAuthProviders.userId, userId),
        eq(userAuthProviders.provider, provider as any)
      ));
    return (result?.rowCount || 0) > 0;
  }

  async getUserByProviderInfo(provider: string, providerUserId: string): Promise<User | undefined> {
    const [authProvider] = await db.select()
      .from(userAuthProviders)
      .where(and(
        eq(userAuthProviders.provider, provider as any),
        eq(userAuthProviders.providerUserId, providerUserId)
      ));
    
    if (!authProvider) return undefined;
    
    return await this.getUser(authProvider.userId);
  }

  async updateAuthProviderLastUsed(userId: string, provider: string): Promise<void> {
    await db.update(userAuthProviders)
      .set({ lastUsedAt: new Date() })
      .where(and(
        eq(userAuthProviders.userId, userId),
        eq(userAuthProviders.provider, provider as any)
      ));
  }

}

export const storage = new DatabaseStorage();
