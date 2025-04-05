import { ProjectPromptData, AIUsageLimits, UsageRecord, projectPromptSchema, projectSchema } from '../types/ai';
import { getEnvVariable } from '../lib/env';
import { supabase } from '../lib/supabase';
import { ZodIssue } from 'zod';

// Constants for usage limits
const MAX_PROJECTS_PER_WEEK = 10;
const USAGE_STORAGE_KEY = 'ai_project_usage';

type OpenAIResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

export class AIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // Use our helper to safely get environment variables
    this.apiKey = getEnvVariable('REACT_APP_OPENAI_API_KEY') || getEnvVariable('VITE_OPENAI_API_KEY');
    
    if (!this.apiKey) {
      // In production, log this as a warning but don't expose to users
      console.warn('OpenAI API key not found in environment variables');
    }
  }

  /**
   * Checks if a user has reached their weekly limit for AI project generation
   * Reads from both localStorage (for UI) and database (for enforcement)
   * @param userId The ID of the user
   * @returns An object with hasReachedLimit and remaining properties
   */
  async checkUsageLimit(userId: string): Promise<AIUsageLimits> {
    try {
      // Input validation
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // For security, verify with the database first
      const { data: dbUsage, error } = await supabase
        .from('ai_usage')
        .select('created_at, project_id')
        .eq('user_id', userId)
        .gte('created_at', oneWeekAgo.toISOString());
      
      if (error) {
        console.error('Error fetching AI usage from database:', error);
        // Fall back to client-side tracking on error, but be conservative
        return this.getClientSideUsage(userId);
      }
      
      // Calculate usage based on database records (source of truth)
      const projectsThisWeek = dbUsage ? dbUsage.length : 0;
      const remaining = MAX_PROJECTS_PER_WEEK - projectsThisWeek;
      
      // Calculate when the limit will reset
      let resetTime: Date | undefined;
      if (projectsThisWeek > 0 && projectsThisWeek >= MAX_PROJECTS_PER_WEEK) {
        // Sort by created_at to find the oldest that will expire
        const sortedUsage = [...dbUsage].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const oldestEntry = sortedUsage[0];
        const oldestDate = new Date(oldestEntry.created_at);
        resetTime = new Date(oldestDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      
      // Also update the client-side cache to keep it in sync
      this.syncClientUsageWithDb(userId, dbUsage);
      
      return {
        hasReachedLimit: projectsThisWeek >= MAX_PROJECTS_PER_WEEK,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Error checking AI usage limits:', error);
      // Fall back to client-side tracking on error, but be conservative
      return this.getClientSideUsage(userId);
    }
  }

  /**
   * Gets usage data from client-side storage (less secure backup)
   */
  private getClientSideUsage(userId: string): AIUsageLimits {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      return { hasReachedLimit: true, remaining: 0 };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get stored usage data from localStorage
    const storedUsage = this.getUserUsage(userId);
    
    // Filter to only include projects from the past week
    const recentProjects = storedUsage.projects.filter(
      (project: {timestamp: number, projectId?: string}) => project.timestamp > oneWeekAgo.getTime()
    );
    
    // Calculate remaining projects
    const projectsThisWeek = recentProjects.length;
    const remaining = MAX_PROJECTS_PER_WEEK - projectsThisWeek;
    
    // Calculate when the limit will reset (when the oldest project ages out)
    let resetTime: Date | undefined;
    if (projectsThisWeek > 0 && projectsThisWeek >= MAX_PROJECTS_PER_WEEK) {
      const oldestProject = recentProjects.sort((a: {timestamp: number}, b: {timestamp: number}) => a.timestamp - b.timestamp)[0];
      resetTime = new Date(oldestProject.timestamp + 7 * 24 * 60 * 60 * 1000);
    }
    
    return {
      hasReachedLimit: projectsThisWeek >= MAX_PROJECTS_PER_WEEK,
      remaining,
      resetTime
    };
  }

  /**
   * Synchronizes client-side usage tracking with database records
   */
  private syncClientUsageWithDb(userId: string, dbRecords: any[] | null): void {
    if (!dbRecords || !userId) return;
    
    try {
      const clientUsage: UsageRecord = { userId, projects: [] };
      
      // Convert DB records to client format
      dbRecords.forEach(record => {
        clientUsage.projects.push({
          timestamp: new Date(record.created_at).getTime(),
          projectId: record.project_id
        });
      });
      
      // Store updated records in localStorage
      this.saveUserUsage(clientUsage);
    } catch (error) {
      console.error('Error syncing client usage with DB:', error);
    }
  }

  /**
   * Records that a user has generated an AI project
   * Stores in both database (for enforcement) and localStorage (for UI)
   * @param userId The ID of the user
   * @param projectId Optional ID of the created project
   * @returns The updated usage record
   */
  async recordProjectGeneration(userId: string, projectId?: string): Promise<UsageRecord> {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    try {
      // First, record in the database (source of truth)
      const { error } = await supabase
        .from('ai_usage')
        .insert({
          user_id: userId,
          project_id: projectId,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error recording AI usage in database:', error);
      }
      
      // Also update the client-side cache
      const usage = this.getUserUsage(userId);
      
      // Add the new project to the usage data
      usage.projects.push({
        timestamp: Date.now(),
        projectId
      });
      
      // Store the updated usage data
      this.saveUserUsage(usage);
      
      return usage;
    } catch (error) {
      console.error('Error recording project generation:', error);
      // Update local storage even if DB fails
      const usage = this.getUserUsage(userId);
      usage.projects.push({
        timestamp: Date.now(),
        projectId
      });
      this.saveUserUsage(usage);
      return usage;
    }
  }

  /**
   * Gets the user's AI project generation usage data from localStorage
   * @param userId The ID of the user
   * @returns The user's usage record
   */
  private getUserUsage(userId: string): UsageRecord {
    if (!userId) {
      return { userId: 'anonymous', projects: [] };
    }

    try {
      // Try to get from localStorage
      const storageData = localStorage.getItem(USAGE_STORAGE_KEY);
      const usageData: Record<string, UsageRecord> = storageData ? JSON.parse(storageData) : {};
      
      // Return the user's data or create a new record
      return usageData[userId] || { userId, projects: [] };
    } catch (error) {
      console.error('Error getting usage data:', error);
      return { userId, projects: [] };
    }
  }

  /**
   * Saves the user's AI project generation usage data to localStorage
   * @param usage The user's usage record to save
   */
  private saveUserUsage(usage: UsageRecord): void {
    if (!usage || !usage.userId) return;

    try {
      // Get existing data
      const storageData = localStorage.getItem(USAGE_STORAGE_KEY);
      const usageData: Record<string, UsageRecord> = storageData ? JSON.parse(storageData) : {};
      
      // Update the user's data
      usageData[usage.userId] = usage;
      
      // Save back to localStorage
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usageData));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  async generateProject(promptData: ProjectPromptData): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please check your environment variables.');
    }

    try {
      // Validate input data using Zod
      const validationResult = projectPromptSchema.safeParse(promptData);
      if (!validationResult.success) {
        // Format validation errors into user-friendly messages
        const errorMessages = validationResult.error.errors.map((err: ZodIssue) => {
          const field = err.path.join('.');
          const readableField = field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str: string) => str.toUpperCase());
          
          return `${readableField}: ${err.message}`;
        });
        
        throw new Error(`Please correct the following: ${errorMessages.join(', ')}`);
      }
      
      const validatedData = validationResult.data;
      
      // Create the prompt from validated data
      const prompt = this.generatePrompt(validatedData);
      
      // Call OpenAI API with sanitized inputs
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a project management assistant that creates detailed project plans with tasks.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        const statusCode = response.status;
        
        // Provide user-friendly error messages based on status codes
        if (statusCode === 401) {
          throw new Error('OpenAI API key is invalid. Please check your API key configuration.');
        } else if (statusCode === 429) {
          throw new Error('OpenAI rate limit exceeded. Please try again in a few minutes.');
        } else if (statusCode >= 500) {
          throw new Error('OpenAI service is currently unavailable. Please try again later.');
        }
        
        throw new Error(`OpenAI API error ${statusCode}: ${errorData.substring(0, 100)}`);
      }

      const data = await response.json() as OpenAIResponse;
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Invalid response from OpenAI API. Please try again with a different description.');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && error.message.startsWith('Please correct')) {
        throw error; // Already formatted for user display
      }
      
      if (error instanceof Error && error.name === 'ZodError') {
        console.error('Input validation error:', error);
        // Extract validation error messages
        try {
          const zodError = error as unknown as { errors: { path: string[], message: string }[] };
          const errorMessages = zodError.errors.map(err => {
            const field = err.path.join('.');
            return `${field}: ${err.message}`;
          });
          
          throw new Error(`Invalid project data: ${errorMessages.join(', ')}`);
        } catch (e) {
          throw new Error('Invalid project data. Please check your input and try again.');
        }
      }
      
      // Re-throw API errors (already handled above with friendly messages)
      if (error instanceof Error && 
         (error.message.includes('OpenAI API error') || 
          error.message.includes('OpenAI API key') ||
          error.message.includes('OpenAI rate limit') ||
          error.message.includes('OpenAI service'))) {
        throw error;
      }
      
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to generate project with AI. Please check your inputs and try again.');
    }
  }

  private generatePrompt(data: ProjectPromptData): string {
    return `
Create a detailed project plan based on the following description:
"${data.description}"

The project should have ${data.numTasks} tasks, start on ${data.startDate} and end by ${data.endDate}.

For each task, provide:
1. A clear, specific title
2. A detailed description
3. Status should be "todo" for ALL tasks
4. A priority level (low, medium, high)
5. Start and end dates within the project timeline
6. All tasks should have "completed" set to false

For the project:
1. Create a concise, professional project title (keep it under 50 characters)
2. Create a comprehensive project description that preserves the original meaning but is well-structured
3. The overall project status should be "not_started"
4. Set an appropriate project priority (low, medium, high)

IMPORTANT: Return ONLY the JSON data without any explanations, markdown formatting, or code blocks. 
Your entire response should be a valid JSON object and nothing else.

The JSON structure should be exactly like this:
{
  "title": "Project Title",
  "description": "Project Description",
  "status": "not_started",
  "priority": "medium",
  "startDate": "2023-01-01",
  "endDate": "2023-01-30",
  "tasks": [
    {
      "title": "Task 1",
      "description": "Task 1 Description",
      "status": "todo",
      "priority": "high",
      "startDate": "2023-01-01",
      "endDate": "2023-01-05",
      "completed": false,
      "orderIndex": 0,
      "parentId": null
    }
  ]
}
`;
  }

  async parseAIResponse(response: string) {
    try {
      // Input validation
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid AI response: Empty or non-string response received');
      }

      // Only log raw response in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log("Raw AI response:", response);
      }
      
      // Try to parse the entire response as JSON first
      try {
        const parsedJson = JSON.parse(response);
        
        // Validate the parsed JSON against our schema
        try {
          const validationResult = projectSchema.safeParse(parsedJson);
          
          if (!validationResult.success) {
            // Format validation errors for debugging
            const errorMessages = validationResult.error.errors.map((err: ZodIssue) => {
              const field = err.path.join('.');
              return `${field}: ${err.message}`;
            });
            
            // Only log detailed errors in development
            if (process.env.NODE_ENV !== 'production') {
              console.error('Project validation errors:', errorMessages);
            }
            throw new Error(`Project validation failed: ${errorMessages.join(', ')}`);
          }
          
          return validationResult.data;
        } catch (validationError) {
          console.error('Validation error:', validationError);
          throw new Error('Failed to validate project data. The AI response was missing required fields or had invalid data.');
        }
      } catch (parseError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Initial JSON parse error:', parseError);
        }
         
        // If initial parse fails, try to extract JSON using regex
        if (process.env.NODE_ENV !== 'production') {
          console.log("Attempting to extract JSON from text response...");
        }
        try {
          // Try to find JSON-like content in the string
          const possibleJson = this.findJsonInString(response);
          if (possibleJson) {
            if (process.env.NODE_ENV !== 'production') {
              console.log("Found potential JSON content");
            }
            
            // Validate extracted JSON
            const extractedData = JSON.parse(possibleJson);
            const validationResult = projectSchema.safeParse(extractedData);
            
            if (validationResult.success) {
              if (process.env.NODE_ENV !== 'production') {
                console.log("Successfully parsed and validated extracted JSON");
              }
              return validationResult.data;
            } else {
              if (process.env.NODE_ENV !== 'production') {
                console.error('Extracted JSON validation errors:', validationResult.error);
              }
              throw new Error('The AI generated incomplete project data. Please try again with a more detailed description.');
            }
          }
        } catch (extractError) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('JSON extraction error:', extractError);
          }
        }
        
        // If all parsing attempts fail, throw a user-friendly error
        throw new Error('Failed to parse AI response as valid project data. Please try again with a clearer project description.');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error in parseAIResponse:', error);
      }
      
      // Provide specific error messages based on error type
      if (error instanceof Error) {
        // Pass through formatted errors
        if (error.message.startsWith('Invalid AI response:') ||
            error.message.startsWith('Failed to parse') ||
            error.message.startsWith('Project validation failed:') ||
            error.message.includes('was missing required fields')) {
          throw error;
        }
        
        // For syntax errors in JSON parsing
        if (error.name === 'SyntaxError') {
          throw new Error('The AI generated an invalid JSON format. Please try again with a different project description.');
        }
      }
      
      // Generic fallback error
      throw new Error('Failed to parse AI response. Please try again with a more specific project description.');
    }
  }
  
  /**
   * Helper method to try to find valid JSON in a string
   * Useful when the AI might include extra text around the JSON
   */
  private findJsonInString(text: string): string | null {
    try {
      // Try to find JSON-like content with a regex that looks for objects
      const jsonRegex = /{[\s\S]*}/;
      const match = text.match(jsonRegex);
      
      if (match && match[0]) {
        // Clean up the potential JSON string
        return match[0]
          .replace(/\\n/g, "\\n") // Ensure newlines are properly escaped
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Add quotes to keys without them
      }
      
      return null;
    } catch (error) {
      console.error('Error finding JSON in string:', error);
      return null;
    }
  }
}

export const aiService = new AIService(); 