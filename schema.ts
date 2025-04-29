import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  averageRating: integer("average_rating"),
});

export const skillCategories = [
  "programming",
  "design",
  "language",
  "music",
  "business",
  "lifestyle",
  "other",
] as const;

export const proficiencyLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  isTeaching: boolean("is_teaching").notNull(),
  proficiency: text("proficiency"),
  icon: text("icon"),
  averageRating: integer("average_rating"),
  activeStudents: integer("active_students").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillAssessments = pgTable("skill_assessments", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // pending, in_progress, completed
  currentStep: integer("current_step").default(1),
  knowledgeScore: integer("knowledge_score"),
  practicalScore: integer("practical_score"),
  teachingScore: integer("teaching_score"),
  overallScore: integer("overall_score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctOption: integer("correct_option").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillExchanges = pgTable("skill_exchanges", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  teacherSkillId: integer("teacher_skill_id").notNull().references(() => skills.id),
  status: text("status").notNull(), // pending, active, completed
  studentRating: integer("student_rating"),
  teacherRating: integer("teacher_rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  bio: true,
  profileImage: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  userId: true,
  name: true,
  description: true,
  category: true,
  isTeaching: true,
  proficiency: true,
  icon: true,
});

export const insertAssessmentSchema = createInsertSchema(skillAssessments).pick({
  skillId: true,
  userId: true,
  status: true,
  currentStep: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

export const insertExchangeSchema = createInsertSchema(skillExchanges).pick({
  teacherId: true,
  studentId: true,
  teacherSkillId: true,
  status: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type SkillAssessment = typeof skillAssessments.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type SkillExchange = typeof skillExchanges.$inferSelect;

// Extended schemas for validation
export const authUserSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(3, "Full name is required"),
});

export const skillValidationSchema = insertSkillSchema.extend({
  name: z.string().min(3, "Skill name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(skillCategories, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  proficiency: z.enum(proficiencyLevels, {
    errorMap: () => ({ message: "Please select a valid proficiency level" }),
  }).optional().nullable(),
});
