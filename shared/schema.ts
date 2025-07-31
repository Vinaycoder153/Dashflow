import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // For storing tool usage, voice data, etc.
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  voiceSpeed: text("voice_speed").default("1.0"),
  voicePitch: text("voice_pitch").default("1.0"),
  autoScroll: boolean("auto_scroll").default(true),
  theme: text("theme").default("light"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  content: true,
  sender: true,
  metadata: true,
}).extend({
  sessionId: z.string(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  voiceSpeed: true,
  voicePitch: true,
  autoScroll: true,
  theme: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
