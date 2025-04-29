import type { User, InsertUser, Skill, InsertSkill, SkillAssessment, InsertAssessment, Message, InsertMessage, SkillExchange, InsertExchange } from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from './db';
import { pool } from './db';
import { eq, or, and, desc, asc } from 'drizzle-orm';
import {
  users,
  skills,
  skillAssessments,
  assessmentQuestions,
  messages,
  skillExchanges
} from '@shared/schema';

// For session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRating(userId: number, rating: number): Promise<void>;
  
  // Skill operations
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUser(userId: number, isTeaching?: boolean): Promise<Skill[]>;
  getAllSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Assessment operations
  getAssessment(id: number): Promise<SkillAssessment | undefined>;
  getAssessmentsByUser(userId: number): Promise<SkillAssessment[]>;
  getAssessmentsBySkill(skillId: number): Promise<SkillAssessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<SkillAssessment>;
  updateAssessment(id: number, assessment: Partial<SkillAssessment>): Promise<SkillAssessment | undefined>;
  getAssessmentQuestions(category: string, count: number): Promise<any[]>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Exchange operations
  getExchange(id: number): Promise<SkillExchange | undefined>;
  getExchangesByUser(userId: number): Promise<SkillExchange[]>;
  createExchange(exchange: InsertExchange): Promise<SkillExchange>;
  updateExchange(id: number, exchange: Partial<SkillExchange>): Promise<SkillExchange | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Seed assessment questions if none exist
    this.seedAssessmentQuestionsIfEmpty();
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserRating(userId: number, rating: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      let newRating: number;
      if (user.averageRating === null) {
        newRating = rating;
      } else {
        // Simple average calculation, in a real app this would be more sophisticated
        newRating = Math.round((user.averageRating + rating) / 2);
      }
      
      await db.update(users)
        .set({ averageRating: newRating })
        .where(eq(users.id, userId));
    }
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async getSkillsByUser(userId: number, isTeaching?: boolean): Promise<Skill[]> {
    if (isTeaching !== undefined) {
      return db.select().from(skills)
        .where(and(
          eq(skills.userId, userId),
          eq(skills.isTeaching, isTeaching)
        ));
    }
    return db.select().from(skills).where(eq(skills.userId, userId));
  }

  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async updateSkill(id: number, skillUpdate: Partial<Skill>): Promise<Skill | undefined> {
    const [updated] = await db.update(skills)
      .set(skillUpdate)
      .where(eq(skills.id, id))
      .returning();
    
    return updated;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id));
    return result.count > 0;
  }

  async getAssessment(id: number): Promise<SkillAssessment | undefined> {
    const [assessment] = await db.select().from(skillAssessments).where(eq(skillAssessments.id, id));
    return assessment;
  }

  async getAssessmentsByUser(userId: number): Promise<SkillAssessment[]> {
    return db.select().from(skillAssessments).where(eq(skillAssessments.userId, userId));
  }

  async getAssessmentsBySkill(skillId: number): Promise<SkillAssessment[]> {
    return db.select().from(skillAssessments).where(eq(skillAssessments.skillId, skillId));
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<SkillAssessment> {
    const [assessment] = await db.insert(skillAssessments).values(insertAssessment).returning();
    return assessment;
  }

  async updateAssessment(id: number, assessmentUpdate: Partial<SkillAssessment>): Promise<SkillAssessment | undefined> {
    // If all scores are now set, calculate overall score and set completedAt
    const existingAssessment = await this.getAssessment(id);
    
    if (!existingAssessment) {
      return undefined;
    }
    
    const updatedData = { ...assessmentUpdate };
    
    if (
      (existingAssessment.knowledgeScore !== null || assessmentUpdate.knowledgeScore !== undefined) &&
      (existingAssessment.practicalScore !== null || assessmentUpdate.practicalScore !== undefined) &&
      (existingAssessment.teachingScore !== null || assessmentUpdate.teachingScore !== undefined)
    ) {
      const knowledgeScore = assessmentUpdate.knowledgeScore ?? existingAssessment.knowledgeScore ?? 0;
      const practicalScore = assessmentUpdate.practicalScore ?? existingAssessment.practicalScore ?? 0;
      const teachingScore = assessmentUpdate.teachingScore ?? existingAssessment.teachingScore ?? 0;
      
      updatedData.overallScore = Math.round((knowledgeScore + practicalScore + teachingScore) / 3);
      
      if (
        (assessmentUpdate.status === 'completed' || existingAssessment.status === 'completed') && 
        !existingAssessment.completedAt
      ) {
        updatedData.completedAt = new Date();
      }
    }
    
    const [updated] = await db.update(skillAssessments)
      .set(updatedData)
      .where(eq(skillAssessments.id, id))
      .returning();
    
    return updated;
  }

  async getAssessmentQuestions(category: string, count: number): Promise<any[]> {
    let questions = await db.select().from(assessmentQuestions)
      .where(eq(assessmentQuestions.category, category));
    
    // Sort randomly and limit to requested count
    return questions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return db.select().from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
    
    return result.count > 0;
  }

  async getExchange(id: number): Promise<SkillExchange | undefined> {
    const [exchange] = await db.select().from(skillExchanges).where(eq(skillExchanges.id, id));
    return exchange;
  }

  async getExchangesByUser(userId: number): Promise<SkillExchange[]> {
    return db.select().from(skillExchanges)
      .where(or(
        eq(skillExchanges.teacherId, userId),
        eq(skillExchanges.studentId, userId)
      ));
  }

  async createExchange(insertExchange: InsertExchange): Promise<SkillExchange> {
    const [exchange] = await db.insert(skillExchanges).values(insertExchange).returning();
    return exchange;
  }

  async updateExchange(id: number, exchangeUpdate: Partial<SkillExchange>): Promise<SkillExchange | undefined> {
    const existingExchange = await this.getExchange(id);
    
    if (!existingExchange) {
      return undefined;
    }
    
    // Update with new timestamp
    const updatedData = { 
      ...exchangeUpdate,
      updatedAt: new Date() 
    };
    
    const [updated] = await db.update(skillExchanges)
      .set(updatedData)
      .where(eq(skillExchanges.id, id))
      .returning();
    
    // Update user ratings if provided
    if (exchangeUpdate.teacherRating && existingExchange.teacherRating !== exchangeUpdate.teacherRating) {
      await this.updateUserRating(existingExchange.teacherId, exchangeUpdate.teacherRating);
    }
    
    if (exchangeUpdate.studentRating && existingExchange.studentRating !== exchangeUpdate.studentRating) {
      await this.updateUserRating(existingExchange.studentId, exchangeUpdate.studentRating);
    }
    
    return updated;
  }

  private async seedAssessmentQuestionsIfEmpty() {
    // Check if questions already exist
    const existingQuestions = await db.select().from(assessmentQuestions).limit(1);
    
    if (existingQuestions.length > 0) {
      return; // Questions already exist, no need to seed
    }
    
    // Programming questions
    await db.insert(assessmentQuestions).values([
      {
        category: "programming",
        question: "What is a closure in JavaScript?",
        options: [
          "A function that is called immediately after it's defined",
          "A function that has access to variables in its outer scope",
          "A function that takes another function as an argument",
          "A function that returns a value"
        ],
        correctOption: 1
      },
      {
        category: "programming",
        question: "What does the 'Promise' object represent in JavaScript?",
        options: [
          "A callback function",
          "The eventual completion/failure of an asynchronous operation",
          "A synchronous operation that returns a value",
          "A variable that might change in the future"
        ],
        correctOption: 1
      },
      // Design questions
      {
        category: "design",
        question: "What is the purpose of white space in design?",
        options: [
          "To fill empty areas of the page",
          "To create balance and guide the eye",
          "To save on printing costs",
          "To make text more readable"
        ],
        correctOption: 1
      },
      {
        category: "design",
        question: "What does the acronym 'CMYK' stand for in design?",
        options: [
          "Create, Modify, Yield, Kick",
          "Convert, Match, Yellow, Key",
          "Cyan, Magenta, Yellow, Key (Black)",
          "Color, Mode, Yield, Knockout"
        ],
        correctOption: 2
      },
      // Language questions
      {
        category: "language",
        question: "What is the most widely spoken language in the world by number of native speakers?",
        options: [
          "English",
          "Spanish",
          "Mandarin Chinese",
          "Hindi"
        ],
        correctOption: 2
      },
      {
        category: "language",
        question: "What is a cognate in language learning?",
        options: [
          "A word that has the same spelling but different meaning in two languages",
          "A word that has a similar meaning and spelling in two languages",
          "A grammatical structure unique to a language",
          "A word with no equivalent in another language"
        ],
        correctOption: 1
      }
    ]);
  }
}

export const storage = new DatabaseStorage();