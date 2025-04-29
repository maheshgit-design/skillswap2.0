import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSkillSchema, 
  insertMessageSchema, 
  insertExchangeSchema, 
  insertAssessmentSchema,
  skillValidationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Skill routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get("/api/skills/teaching", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const skills = await storage.getSkillsByUser(req.user!.id, true);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teaching skills" });
    }
  });

  app.get("/api/skills/learning", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const skills = await storage.getSkillsByUser(req.user!.id, false);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning skills" });
    }
  });

  app.get("/api/skills/:id", async (req, res) => {
    try {
      const skill = await storage.getSkill(parseInt(req.params.id));
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skill" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Validate request body
      const validationResult = skillValidationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.format() });
      }
      
      // Set the current user as the owner
      const skillData = { ...req.body, userId: req.user!.id };
      const skill = await storage.createSkill(skillData);
      
      res.status(201).json(skill);
    } catch (error) {
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.put("/api/skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const skillId = parseInt(req.params.id);
      const existingSkill = await storage.getSkill(skillId);
      
      if (!existingSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Check if the skill belongs to the current user
      if (existingSkill.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this skill" });
      }
      
      const validationResult = skillValidationSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.format() });
      }
      
      const updatedSkill = await storage.updateSkill(skillId, req.body);
      res.json(updatedSkill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const skillId = parseInt(req.params.id);
      const existingSkill = await storage.getSkill(skillId);
      
      if (!existingSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Check if the skill belongs to the current user
      if (existingSkill.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this skill" });
      }
      
      const success = await storage.deleteSkill(skillId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete skill" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Assessment routes
  app.get("/api/assessments/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const assessments = await storage.getAssessmentsByUser(req.user!.id);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/skill/:skillId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const skillId = parseInt(req.params.skillId);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Check if the skill belongs to the current user
      if (skill.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view these assessments" });
      }
      
      const assessments = await storage.getAssessmentsBySkill(skillId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });
  
  app.get("/api/assessments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const assessment = await storage.getAssessment(parseInt(req.params.id));
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      // Check if the assessment belongs to the current user
      if (assessment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this assessment" });
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const validationResult = insertAssessmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.format() });
      }
      
      // Set the current user as the owner
      const assessmentData = { ...req.body, userId: req.user!.id };
      const assessment = await storage.createAssessment(assessmentData);
      
      res.status(201).json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.put("/api/assessments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const assessmentId = parseInt(req.params.id);
      const existingAssessment = await storage.getAssessment(assessmentId);
      
      if (!existingAssessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      // Check if the assessment belongs to the current user
      if (existingAssessment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this assessment" });
      }
      
      const updatedAssessment = await storage.updateAssessment(assessmentId, req.body);
      res.json(updatedAssessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });
  
  app.get("/api/assessment/questions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const category = req.query.category as string;
      const count = parseInt(req.query.count as string || "10");
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }
      
      const questions = await storage.getAssessmentQuestions(category, count);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment questions" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const messages = await storage.getMessagesByUser(req.user!.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/conversation/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const otherUserId = parseInt(req.params.userId);
      const conversation = await storage.getConversation(req.user!.id, otherUserId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const validationResult = insertMessageSchema.safeParse({
        ...req.body,
        senderId: req.user!.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.format() });
      }
      
      const message = await storage.createMessage(validationResult.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if the user is the receiver of the message
      if (message.receiverId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }
      
      const success = await storage.markMessageAsRead(messageId);
      if (success) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to mark message as read" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Exchange routes
  app.get("/api/exchanges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const exchanges = await storage.getExchangesByUser(req.user!.id);
      res.json(exchanges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchanges" });
    }
  });

  app.post("/api/exchanges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Validate request body
      const validationResult = insertExchangeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.format() });
      }
      
      // Check if user is the student
      if (req.body.studentId !== req.user!.id) {
        return res.status(403).json({ message: "You can only create exchanges as a student" });
      }
      
      const exchange = await storage.createExchange(req.body);
      res.status(201).json(exchange);
    } catch (error) {
      res.status(500).json({ message: "Failed to create exchange" });
    }
  });

  app.put("/api/exchanges/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const exchangeId = parseInt(req.params.id);
      const existingExchange = await storage.getExchange(exchangeId);
      
      if (!existingExchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Check if the user is part of the exchange
      if (existingExchange.teacherId !== req.user!.id && existingExchange.studentId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this exchange" });
      }
      
      // Handle ratings - students can only rate teachers and vice versa
      if (req.body.studentRating && req.user!.id !== existingExchange.studentId) {
        return res.status(403).json({ message: "Only students can provide student ratings" });
      }
      
      if (req.body.teacherRating && req.user!.id !== existingExchange.teacherId) {
        return res.status(403).json({ message: "Only teachers can provide teacher ratings" });
      }
      
      const updatedExchange = await storage.updateExchange(exchangeId, req.body);
      res.json(updatedExchange);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exchange" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const userId = req.user!.id;
      
      // Get user's skills
      const teachingSkills = await storage.getSkillsByUser(userId, true);
      const learningSkills = await storage.getSkillsByUser(userId, false);
      
      // Get active exchanges
      const exchanges = await storage.getExchangesByUser(userId);
      const activeExchanges = exchanges.filter(ex => ex.status === 'active');
      
      // Calculate average rating across teaching skills
      const skillsWithRatings = teachingSkills.filter(skill => skill.averageRating !== null);
      const averageRating = skillsWithRatings.length > 0
        ? skillsWithRatings.reduce((sum, skill) => sum + (skill.averageRating || 0), 0) / skillsWithRatings.length
        : null;
      
      res.json({
        teachingSkillsCount: teachingSkills.length,
        learningSkillsCount: learningSkills.length,
        activeExchangesCount: activeExchanges.length,
        averageRating: averageRating
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
