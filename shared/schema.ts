import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  pgEnum,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Countries reference table
export const countries = pgTable("countries", {
  code: varchar("code", { length: 2 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Languages reference table
export const languages = pgTable("languages", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }),
  nativeName: varchar("native_name", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Skills reference table
export const skills = pgTable("skills", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional categories reference table
export const categories = pgTable("categories", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  iconUrl: varchar("icon_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  // Separate address fields
  address: text("address"),
  city: varchar("city"),
  postalCode: varchar("postal_code"),
  countryCode: varchar("country_code").references(() => countries.code),
  title: varchar("title"),
  description: text("description"),
  // Language preferences
  primaryLanguageId: integer("primary_language_id").references(() => languages.id),
  // Category selection
  categoryId: integer("category_id").references(() => categories.id),
  // Admin and authentication fields
  isAdmin: boolean("is_admin").default(false),
  username: varchar("username"), // For admin login
  passwordHash: varchar("password_hash"), // Encrypted password for admin
  role: varchar("role").default("guest"), // guest, host, admin
  // Stripe integration
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeAccountId: varchar("stripe_account_id"), // For Stripe Connect (hosts)
  stripeOnboardingCompleted: boolean("stripe_onboarding_completed").default(false),
  // User verification and GDPR compliance
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  verificationDocuments: text("verification_documents"), // JSON array of document paths
  gdprConsent: boolean("gdpr_consent").default(false),
  gdprConsentDate: timestamp("gdpr_consent_date"),
  dataRetentionDate: timestamp("data_retention_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User secondary languages junction table
export const userLanguages = pgTable("user_languages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: integer("language_id").notNull().references(() => languages.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User skills junction table
export const userSkills = pgTable("user_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email template types
export const emailTemplateTypeEnum = pgEnum("email_template_type", [
  "user_registration",
  "password_change", 
  "account_deletion",
  "account_deactivation",
  "booking_created",
  "booking_received",
  "user_message"
]);

// Media content type enum
export const mediaTypeEnum = pgEnum('media_type', ['youtube', 'video', 'image']);

// Media content table
export const mediaContent = pgTable("media_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(), // For YouTube URLs or file paths for local content
  title: varchar("title"),
  description: text("description"),
  embedId: varchar("embed_id"), // For YouTube video ID
  fileName: varchar("file_name"), // Original filename for uploaded files
  fileSize: varchar("file_size"), // File size in bytes
  mimeType: varchar("mime_type"), // MIME type for uploaded files
  displayOrder: integer("display_order").default(0), // For drag-and-drop ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email templates table for customizable notifications
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: emailTemplateTypeEnum("type").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  variables: text("variables"), // JSON array of available variables
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email notifications log
export const emailNotifications = pgTable("email_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  recipientEmail: varchar("recipient_email").notNull(),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  templateType: emailTemplateTypeEnum("template_type").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, failed
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  variables: jsonb("variables"), // Variables used in the email
  createdAt: timestamp("created_at").defaultNow(),
});

// User messages table for contact/inquiry system
export const userMessages = pgTable("user_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderEmail: varchar("sender_email").notNull(),
  senderName: varchar("sender_name").notNull(),
  recipientId: varchar("recipient_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  country: one(countries, {
    fields: [users.countryCode],
    references: [countries.code],
  }),
  primaryLanguage: one(languages, {
    fields: [users.primaryLanguageId],
    references: [languages.id],
  }),
  category: one(categories, {
    fields: [users.categoryId],
    references: [categories.id],
  }),
  mediaContent: many(mediaContent),
  userLanguages: many(userLanguages),
  userSkills: many(userSkills),
}));

export const userLanguagesRelations = relations(userLanguages, ({ one }) => ({
  user: one(users, {
    fields: [userLanguages.userId],
    references: [users.id],
  }),
  language: one(languages, {
    fields: [userLanguages.languageId],
    references: [languages.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const mediaContentRelations = relations(mediaContent, ({ one }) => ({
  user: one(users, {
    fields: [mediaContent.userId],
    references: [users.id],
  }),
}));

// Schema exports
// Document types enum for verification
export const documentTypeEnum = pgEnum('document_type', [
  'id_front', 'id_back', 'passport', 'driving_license', 
  'utility_bill', 'bank_statement', 'other'
]);

// User verification documents table  
export const userDocuments = pgTable("user_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  documentType: documentTypeEnum("document_type").notNull(),
  filePath: text("file_path").notNull(),
  originalFileName: varchar("original_file_name"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserDocument = typeof userDocuments.$inferSelect;
export type InsertUserDocument = typeof userDocuments.$inferInsert;
export type Country = typeof countries.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserLanguage = typeof userLanguages.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;

export const insertMediaContentSchema = createInsertSchema(mediaContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertUserLanguageSchema = createInsertSchema(userLanguages).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaContent = z.infer<typeof insertMediaContentSchema>;
export type MediaContent = Omit<typeof mediaContent.$inferSelect, 'title' | 'description'> & {
  title?: string;
  description?: string;
};
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertUserLanguage = z.infer<typeof insertUserLanguageSchema>;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

// Host availability and booking system
export const hostAvailability = pgTable("host_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date"), // Specific date (YYYY-MM-DD) - null for recurring weekly
  dayOfWeek: integer("day_of_week"), // 0-6 (Sunday-Saturday) - for recurring weekly
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hostPricing = pgTable("host_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  duration: integer("duration").notNull(), // in minutes (0, 30, 60, 90, or custom)
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // 0 for free
  currency: varchar("currency").default("EUR"),
  isActive: boolean("is_active").default(true),
  isCustom: boolean("is_custom").default(false), // true for custom duration/price
  // Additional service options
  includesScreenSharing: boolean("includes_screen_sharing").default(false),
  includesTranslation: boolean("includes_translation").default(false),
  includesRecording: boolean("includes_recording").default(false),
  includesTranscription: boolean("includes_transcription").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduledDate: date("scheduled_date").notNull(),
  startTime: varchar("start_time").notNull(), // HH:MM format
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("EUR"),
  status: varchar("status").default("pending"), // pending, confirmed, completed, cancelled
  agoraChannelName: varchar("agora_channel_name"),
  agoraToken: text("agora_token"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hostCategories = pgTable("host_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export type HostAvailability = typeof hostAvailability.$inferSelect;
export type InsertHostAvailability = typeof hostAvailability.$inferInsert;
export type HostPricing = typeof hostPricing.$inferSelect;
export type InsertHostPricing = typeof hostPricing.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type HostCategory = typeof hostCategories.$inferSelect;
export type InsertHostCategory = typeof hostCategories.$inferInsert;

// Stripe payment status enum
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'
]);

// Stripe payments table for transaction tracking
export const stripePayments = pgTable("stripe_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Total amount
  hostAmount: decimal("host_amount", { precision: 10, scale: 2 }).notNull(), // Amount for host (after commission)
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(), // Dialoom commission
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(), // VAT on commission
  currency: varchar("currency").default("EUR"),
  status: paymentStatusEnum("status").default("pending"),
  // Service add-ons pricing breakdown
  screenSharingFee: decimal("screen_sharing_fee", { precision: 10, scale: 2 }).default("0"),
  translationFee: decimal("translation_fee", { precision: 10, scale: 2 }).default("0"),
  recordingFee: decimal("recording_fee", { precision: 10, scale: 2 }).default("0"),
  transcriptionFee: decimal("transcription_fee", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table for downloadable invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(), // Sequential number: DIAL-2025-00001
  paymentId: varchar("payment_id").notNull().references(() => stripePayments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id), // Who receives the invoice
  hostId: varchar("host_id").notNull().references(() => users.id), // Service provider
  issueDate: date("issue_date").notNull().defaultNow(),
  dueDate: date("due_date"), // For future invoices
  pdfPath: text("pdf_path"), // Path to generated PDF in Object Storage
  isDownloaded: boolean("is_downloaded").default(false),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Global configuration for admin-managed settings
export const adminConfig = pgTable("admin_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(), // config keys like 'commission_rate', 'screen_sharing_price'
  value: text("value").notNull(), // JSON values for flexibility
  description: text("description"), // Human-readable description
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin audit log
export const adminAuditLog = pgTable("admin_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'update_commission', 'update_service_price', 'verify_user'
  targetTable: varchar("target_table"), // Table affected
  targetId: varchar("target_id"), // ID of affected record
  oldValue: jsonb("old_value"), // Previous value
  newValue: jsonb("new_value"), // New value
  description: text("description"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for new tables
export const stripePaymentsRelations = relations(stripePayments, ({ one }) => ({
  booking: one(bookings, {
    fields: [stripePayments.bookingId],
    references: [bookings.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  payment: one(stripePayments, {
    fields: [invoices.paymentId],
    references: [stripePayments.id],
  }),
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  host: one(users, {
    fields: [invoices.hostId],
    references: [users.id],
  }),
}));

export const adminConfigRelations = relations(adminConfig, ({ one }) => ({
  updatedBy: one(users, {
    fields: [adminConfig.updatedBy],
    references: [users.id],
  }),
}));

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLog.adminId],
    references: [users.id],
  }),
}));

// Export new types
export type StripePayment = typeof stripePayments.$inferSelect;
export type InsertStripePayment = typeof stripePayments.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type AdminConfig = typeof adminConfig.$inferSelect;
export type InsertAdminConfig = typeof adminConfig.$inferInsert;
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

// Create schemas for validation
export const createStripePaymentSchema = createInsertSchema(stripePayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAdminConfigSchema = createInsertSchema(adminConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateStripePayment = z.infer<typeof createStripePaymentSchema>;
export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export type UpdateAdminConfig = z.infer<typeof updateAdminConfigSchema>;

// Email system types
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;
export type UserMessage = typeof userMessages.$inferSelect;
export type InsertUserMessage = typeof userMessages.$inferInsert;

// Email template validation schemas
export const createEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const createEmailNotificationSchema = createInsertSchema(emailNotifications).omit({
  id: true,
  createdAt: true,
});

export const createUserMessageSchema = createInsertSchema(userMessages).omit({
  id: true,
  createdAt: true,
  isRead: true,
  repliedAt: true,
});

export type CreateEmailTemplate = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplate = z.infer<typeof updateEmailTemplateSchema>;
export type CreateEmailNotification = z.infer<typeof createEmailNotificationSchema>;
export type CreateUserMessage = z.infer<typeof createUserMessageSchema>;
