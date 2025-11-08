import React, { createContext, useContext, useState } from 'react';
import { getTaskInsights, getDailySummary } from '../services/gemini';

const AIInsightsContext = createContext();

export const useAIInsights = () => {
  const context = useContext(AIInsightsContext);
  if (!context) {
    throw new Error('useAIInsights must be used within an AIInsightsProvider');
  }
  return context;
};

export const AIInsightsProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState({});

  const generateTaskInsights = async (task, company, previousTasks, stickyNotes) => {
    setLoading(true);
    try {
      const insight = await getTaskInsights(task, company, previousTasks, stickyNotes);
      setInsights(prev => ({
        ...prev,
        [task.id]: insight
      }));
      return insight;
    } catch (error) {
      console.error('Error generating task insights:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateDailySummary = async (completedTasks, currentTasks, company) => {
    setLoading(true);
    try {
      const summary = await getDailySummary(completedTasks, currentTasks, company);
      return summary;
    } catch (error) {
      console.error('Error generating daily summary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCachedInsights = (taskId) => {
    return insights[taskId] || null;
  };

  const value = {
    loading,
    generateTaskInsights,
    generateDailySummary,
    getCachedInsights
  };

  return (
    <AIInsightsContext.Provider value={value}>
      {children}
    </AIInsightsContext.Provider>
  );
};