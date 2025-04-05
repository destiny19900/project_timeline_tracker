import { ProjectPromptData } from '../types/ai';
import { getEnvVariable } from '../lib/env';

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
      console.warn('OpenAI API key not found in environment variables');
    }
  }

  async generateProject(promptData: ProjectPromptData): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = this.generatePrompt(promptData);
    
    try {
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
        throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
      }

      const data = await response.json() as OpenAIResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to generate project with AI');
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
      console.log("Raw AI response:", response);
      
      // Try to parse the entire response as JSON first
      try {
        return JSON.parse(response);
      } catch (e) {
        console.log("Could not parse raw response as JSON, trying to extract JSON from text");
      }
      
      // Extract JSON from the response if it's embedded in text
      let jsonString = response;
      
      // Try to match JSON inside markdown code blocks
      const jsonBlockMatch = response.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        jsonString = jsonBlockMatch[1];
        console.log("Extracted JSON from code block:", jsonString);
      } else {
        // Try to find the first occurrence of { and the last occurrence of }
        const firstBrace = response.indexOf('{');
        const lastBrace = response.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = response.substring(firstBrace, lastBrace + 1);
          console.log("Extracted JSON using brace matching:", jsonString);
        }
      }
      
      // Clean up potential issues in the extracted JSON
      jsonString = jsonString
        .replace(/[\u201C\u201D]/g, '"') // Replace fancy quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace fancy single quotes
        .replace(/\\'/g, "'") // Replace escaped single quotes
        .replace(/\\n/g, "\\n") // Ensure newlines are properly escaped
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Add quotes to keys without them
      
      console.log("Cleaned JSON string:", jsonString);
      
      // Try to parse the cleaned JSON
      try {
        const parsedData = JSON.parse(jsonString);
        console.log("Successfully parsed JSON:", parsedData);
        return parsedData;
      } catch (jsonError) {
        console.error("JSON parse error after cleaning:", jsonError);
        
        // Last resort - try to manually fix common issues
        try {
          // Sometimes there are trailing commas in arrays or objects
          const fixedString = jsonString
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}');
          console.log("Last attempt with fixed JSON:", fixedString);
          return JSON.parse(fixedString);
        } catch (finalError) {
          // Handle the unknown type by casting or checking
          const errorMessage = finalError instanceof Error 
            ? finalError.message 
            : 'Unknown parsing error';
          console.error("All JSON parsing attempts failed:", errorMessage);
          throw new Error('Failed to parse AI response: ' + errorMessage);
        }
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }
}

export const aiService = new AIService(); 