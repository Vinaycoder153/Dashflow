import { type User, type InsertUser, type Message, type InsertMessage, type UserSettings, type InsertUserSettings, type ChatSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createChatSession(userId: string): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;
  
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.userSettings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default settings for new user
    const defaultSettings: UserSettings = {
      id: randomUUID(),
      userId: id,
      voiceSpeed: "1.0",
      voicePitch: "1.0",
      autoScroll: true,
      theme: "light",
      updatedAt: new Date(),
    };
    this.userSettings.set(id, defaultSettings);
    
    return user;
  }

  async createChatSession(userId: string): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      sessionId: insertMessage.sessionId,
      content: insertMessage.content,
      sender: insertMessage.sender,
      metadata: insertMessage.metadata || null,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.userSettings.get(userId);
  }

  async updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const existing = this.userSettings.get(userId);
    const updated: UserSettings = {
      id: existing?.id || randomUUID(),
      userId,
      voiceSpeed: settings.voiceSpeed || existing?.voiceSpeed || "1.0",
      voicePitch: settings.voicePitch || existing?.voicePitch || "1.0",
      autoScroll: settings.autoScroll !== undefined ? settings.autoScroll : existing?.autoScroll || true,
      theme: settings.theme || existing?.theme || "light",
      updatedAt: new Date(),
    };
    this.userSettings.set(userId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
