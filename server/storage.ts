import {
  users,
  mediaContent,
  countries,
  languages,
  skills,
  categories,
  userLanguages,
  userSkills,
  hostAvailability,
  hostPricing,
  stripePayments,
  invoices,
  adminConfig,
  adminAuditLog,
  bookings,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  
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
  getUserWithPrivateInfo(id: string, requesterId: string): Promise<User | undefined>;
  updateProfileImage(userId: string, imageUrl: string): Promise<User>;
  
  // Admin and verification operations
  getPendingVerificationUsers(): Promise<User[]>;
  verifyUser(userId: string, isVerified: boolean, verifiedBy: string, notes?: string): Promise<void>;
  
  // GDPR compliance operations
  exportUserData(userId: string): Promise<any>;
  requestDataDeletion(userId: string, deletionDate: Date): Promise<void>;
  
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
  getHostBookings(hostId: string): Promise<any[]>;
  getGuestBookings(guestId: string): Promise<any[]>;
  updateBooking(id: string, updates: any): Promise<any | undefined>;
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
    const result = await db
      .delete(mediaContent)
      .where(and(eq(mediaContent.id, id), eq(mediaContent.userId, userId)));
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
}

export const storage = new DatabaseStorage();
