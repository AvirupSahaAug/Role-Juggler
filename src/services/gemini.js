import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_API_KEY');

// Function to get AI insights for a task
export const getTaskInsights = async (task, company, previousTasks, stickyNotes) => {
  try {
    const model = genAI.getGenerativeModel({ model:  "gemini-2.0-flash-lite" });
    
    const prompt = `
      You are a productivity assistant for ${company}. 
      
      TASK: ${task.title}
      DESCRIPTION: ${task.description || 'No description provided'}
      STATUS: ${task.status}
      PRIORITY: ${task.priority}
      ${task.deadline ? `DEADLINE: ${task.deadline}` : ''}
      
      PREVIOUS TASKS COMPLETED FOR ${company}:
      ${previousTasks.map(t => `- ${t.title} (${t.status})`).join('\n') || 'No previous tasks'}
      
      USER NOTES:
      ${stickyNotes.map(n => `- ${n.content}`).join('\n') || 'No notes available'}
      
      Please provide insights about this task in JSON format with the following structure:
      {
        "whatWasDone": ["array of what was already accomplished", "based on task status and previous work"],
        "whatNeedsToBeNext": ["array of suggested next steps", "based on the task requirements"],
        "estimatedTimeLeft": "estimated time to complete (e.g., '2-3 hours')",
        "blockers": ["potential blockers or challenges", "based on the task complexity"],
        "progress": percentage estimate (0-100)
      }
      
      Be specific and actionable. If this is a new task, provide initial guidance.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(prompt);
    console.log(text);
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      whatWasDone: ["Analysis in progress"],
      whatNeedsToBeNext: ["Review task requirements"],
      estimatedTimeLeft: "TBD",
      blockers: [],
      progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0
    };
    
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return {
      whatWasDone: ["Error generating insights"],
      whatNeedsToBeNext: ["Please try again later"],
      estimatedTimeLeft: "Unknown",
      blockers: ["AI service unavailable"],
      progress: 0
    };
  }
};

// Function to generate daily summary
export const getDailySummary = async (completedTasks, currentTasks, company) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      You are a productivity assistant for ${company}. 
      
      TODAY'S COMPLETED TASKS:
      ${completedTasks.map(t => `- ${t.title}`).join('\n') || 'No tasks completed today'}
      
      CURRENT ACTIVE TASKS:
      ${currentTasks.map(t => `- ${t.title} (${t.status})`).join('\n') || 'No active tasks'}
      
      Please provide a brief daily summary and suggestions for tomorrow in JSON format:
      {
        "summary": "brief summary of today's accomplishments",
        "suggestions": ["array of suggestions for tomorrow"],
        "productivityScore": number between 0-100,
        "focusAreas": ["areas that need attention"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      summary: "Daily analysis in progress",
      suggestions: ["Plan tomorrow's tasks"],
      productivityScore: 70,
      focusAreas: ["Task prioritization"]
    };
    
  } catch (error) {
    console.error('Error getting daily summary:', error);
    return {
      summary: "Unable to generate summary",
      suggestions: ["Check AI service connection"],
      productivityScore: 0,
      focusAreas: []
    };
  }
};