/**
 * Types for AI service integration
 */

import { z } from 'zod';

/**
 * Project prompt data schema with validation
 */
export const projectPromptSchema = z.object({
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters")
    .trim(),
  numTasks: z.number()
    .int("Number of tasks must be an integer")
    .min(1, "Minimum 1 task required")
    .max(20, "Maximum 20 tasks allowed"),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
});

/**
 * Interface for project prompt data
 */
export interface ProjectPromptData {
  description: string;
  numTasks: number;
  startDate: string;
  endDate: string;
}

/**
 * Interface for AI usage limits
 */
export interface AIUsageLimits {
  hasReachedLimit: boolean;
  remaining: number;
  resetTime?: Date;
}

/**
 * Interface for tracking usage
 */
export interface UsageRecord {
  userId: string;
  projects: {
    timestamp: number;
    projectId?: string;
  }[];
}

/**
 * Task schema for validation
 */
export const taskSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  status: z.enum(["todo", "in_progress", "completed", "blocked"]),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  completed: z.boolean(),
  orderIndex: z.number().int(),
  parentId: z.string().nullable()
});

/**
 * Project schema for validation
 */
export const projectSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(5000, "Description must be less than 5000 characters"),
  status: z.enum(["not_started", "in_progress", "completed", "on_hold"]),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  tasks: z.array(taskSchema)
}); 