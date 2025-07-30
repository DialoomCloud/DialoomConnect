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
  username: varchar("username").unique(), // For admin login
  passwordHash: varchar("password_hash"), // Encrypted password for admin
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export type MediaContent = typeof mediaContent.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertUserLanguage = z.infer<typeof insertUserLanguageSchema>;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
