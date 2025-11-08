// App.js - Enhanced Main Application Component
import React, { useState, useEffect } from 'react';
import { Briefcase, Filter, LogOut } from 'lucide-react';

import { AIInsightsProvider } from './contexts/AIInsightsContext';
// Import all our custom components
import LoginPage from './components/LoginPage';
import DashboardOverview from './components/DashboardOverview';
import KanbanBoard from './components/KanbanBoard';
import TimeTable from './components/TimeTable';
import ProfilePage from './components/ProfilePage';

// Import API services
import { jobsAPI, tasksAPI, stickyNotesAPI, authAPI } from './services/api';

const App = () => {
  console.log("Gemini API Key:", process.env.REACT_APP_GEMINI_API_KEY);

  // Authentication state
  const [user, setUser] = useState(null);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filter states
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [analyticsJobId, setAnalyticsJobId] = useState(null);
  
  // Data states
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  
  // Enhanced task tracking states
  const [currentTask, setCurrentTask] = useState(null);
  const [pausedTasks, setPausedTasks] = useState([]);
  const [lastTask, setLastTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch all data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, tasksResponse, stickyNotesResponse] = await Promise.all([
        jobsAPI.getAll(),
        tasksAPI.getAll(),
        stickyNotesAPI.getAll()
      ]);
      
      setJobs(jobsResponse.data);
      setTasks(tasksResponse.data);
      setStickyNotes(stickyNotesResponse.data);
      
      // For now, we'll keep meetings and updates as mock data
      // You can implement these later if needed
      setMeetings([]);
      setUpdates([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = (userData) => {
    setUser(userData);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setJobs([]);
      setTasks([]);
      setStickyNotes([]);
      setCurrentTask(null);
      setPausedTasks([]);
      setLastTask(null);
      setActiveTab('dashboard');
    }
  };

  // Job handlers
  const handleAddJob = async (jobData) => {
    try {
      const response = await jobsAPI.create(jobData);
      setJobs([...jobs, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding job:', error.response?.data);
      throw error;
    }
  };

  const handleUpdateJob = async (jobId, updates) => {
    try {
      const response = await jobsAPI.update(jobId, updates);
      setJobs(jobs.map(job => job.id === jobId ? response.data : job));
    } catch (error) {
      console.error('Error updating job:', error.response?.data);
      throw error;
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await jobsAPI.delete(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      
      // Also update tasks that were associated with this job
      setTasks(tasks.map(task => 
        task.job === jobId ? { ...task, job: null } : task
      ));
    } catch (error) {
      console.error('Error deleting job:', error.response?.data);
      throw error;
    }
  };

  // Task handlers
  const handleAddTask = async (newTask) => {
    try {
      // Convert jobId to job if it exists
      const taskData = {
        ...newTask,
        job: newTask.jobId || null
      };
      delete taskData.jobId; // Remove jobId field
      
      const response = await tasksAPI.create(taskData);
      setTasks([...tasks, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding task:', error.response?.data);
      throw error;
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      // Convert jobId to job if it exists in updates
      const updateData = { ...updates };
      if (updateData.jobId !== undefined) {
        updateData.job = updateData.jobId || null;
        delete updateData.jobId;
      }
      
      const response = await tasksAPI.update(taskId, updateData);
      setTasks(tasks.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error.response?.data);
      throw error;
    }
  };

  // Sticky notes handlers
  const handleAddStickyNote = async (noteData) => {
    try {
      const response = await stickyNotesAPI.create(noteData);
      setStickyNotes(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding sticky note:', error.response?.data);
      throw error;
    }
  };

  const handleDeleteStickyNote = async (noteId) => {
    try {
      await stickyNotesAPI.delete(noteId);
      setStickyNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting sticky note:', error.response?.data);
      throw error;
    }
  };

  const handleEditStickyNote = async (noteId, updates) => {
    try {
      const response = await stickyNotesAPI.update(noteId, updates);
      setStickyNotes(prev => 
        prev.map(note => 
          note.id === noteId ? response.data : note
        )
      );
    } catch (error) {
      console.error('Error editing sticky note:', error.response?.data);
      throw error;
    }
  };
  // Analytics filter handler
  const handleAnalyticsJobChange = (jobId) => {
    setAnalyticsJobId(jobId ? parseInt(jobId) : null);
  };
// Add these functions to your App.js, right after the handleTaskUpdate function

// Enhanced task control handlers
const handleTaskControl = async (action, taskId) => {
  const now = Date.now();

  if (action === 'pause') {
    if (currentTask && currentTask.isActive) {
      // Pause current task
      const sessionTime = now - currentTask.startTime;
      const pausedTask = {
        ...currentTask,
        totalTime: sessionTime,
        lastPaused: now,
        sessionNotes: currentTask.sessionNotes || ''
      };
      
      // Add to paused tasks
      setPausedTasks(prev => [pausedTask, ...prev]);
      
      // Update task data with accumulated time
      try {
        await handleTaskUpdate(currentTask.id, {
          total_time_spent: (currentTask.totalTimeSpent || 0) + sessionTime,
          last_worked_on: new Date(now).toISOString()
        });
      } catch (error) {
        console.error('Error updating task:', error);
      }
      
      setCurrentTask(null);
    }
  } else if (action === 'resume') {
    // Resume a paused task
    const taskToResume = pausedTasks.find(task => task.id === taskId);
    if (taskToResume) {
      // Pause current task if any
      if (currentTask && currentTask.isActive) {
        const sessionTime = now - currentTask.startTime;
        const pausedCurrentTask = {
          ...currentTask,
          totalTime: sessionTime,
          lastPaused: now
        };
        setPausedTasks(prev => [pausedCurrentTask, ...prev.filter(t => t.id !== taskId)]);
        
        // Update current task data
        try {
          await handleTaskUpdate(currentTask.id, {
            total_time_spent: (currentTask.totalTimeSpent || 0) + sessionTime,
            last_worked_on: new Date(now).toISOString()
          });
        } catch (error) {
          console.error('Error updating task:', error);
        }
      } else {
        // Just remove from paused tasks
        setPausedTasks(prev => prev.filter(t => t.id !== taskId));
      }

      // Set as current active task
      setCurrentTask({
        ...taskToResume,
        startTime: now,
        isActive: true,
        sessionNotes: taskToResume.sessionNotes || ''
      });
    }
  } else if (action === 'stop') {
    // Complete current session
    if (currentTask && currentTask.id === taskId) {
      const sessionTime = now - currentTask.startTime;
      
      // Move to last task
      setLastTask({
        ...currentTask,
        duration: sessionTime,
        completedAt: now
      });
      
      // Update task data
      try {
        await handleTaskUpdate(currentTask.id, {
          total_time_spent: (currentTask.totalTimeSpent || 0) + sessionTime,
          last_worked_on: new Date(now).toISOString(),
          status: 'done' // Mark as done when stopped
        });
      } catch (error) {
        console.error('Error updating task:', error);
      }
      
      setCurrentTask(null);
    } else {
      // Complete a paused task
      const taskToComplete = pausedTasks.find(task => task.id === taskId);
      if (taskToComplete) {
        setPausedTasks(prev => prev.filter(t => t.id !== taskId));
        
        setLastTask({
          ...taskToComplete,
          duration: taskToComplete.totalTime,
          completedAt: now
        });
        
        // Update task data
        try {
          await handleTaskUpdate(taskId, {
            total_time_spent: (taskToComplete.totalTimeSpent || 0) + taskToComplete.totalTime,
            last_worked_on: new Date(now).toISOString(),
            status: 'done' // Mark as done when stopped
          });
        } catch (error) {
          console.error('Error updating task:', error);
        }
      }
    }
  }
};

// Start a new task
const handleStartTask = async (taskId) => {
  const now = Date.now();
  
  // Pause current task if any
  if (currentTask && currentTask.isActive) {
    const sessionTime = now - currentTask.startTime;
    const pausedCurrentTask = {
      ...currentTask,
      totalTime: sessionTime,
      lastPaused: now
    };
    setPausedTasks(prev => [pausedCurrentTask, ...prev]);
    
    // Update current task data
    try {
      await handleTaskUpdate(currentTask.id, {
        total_time_spent: (currentTask.totalTimeSpent || 0) + sessionTime,
        last_worked_on: new Date(now).toISOString()
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  // Find task details
  const taskToStart = tasks.find(task => task.id === taskId);
  if (taskToStart) {
    setCurrentTask({
      id: taskId,
      title: taskToStart.title,
      jobId: taskToStart.job,
      startTime: now,
      isActive: true,
      sessionNotes: ''
    });

    // Update task status to in-progress if it's not already
    if (taskToStart.status !== 'in-progress') {
      try {
        await handleTaskUpdate(taskId, { status: 'in-progress' });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  }
};
  // Show login page if user is not logged in
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AIInsightsProvider>
      <div className="min-h-screen bg-gray-100">
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">RoleJuggler</h1>
              {currentTask && currentTask.isActive && (
                <div className="ml-6 flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium">
                    {currentTask.title} - Active
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.first_name || user.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'kanban' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kanban Boards
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'timetable' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Time Table
            </button>
            <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2 border-b-2 font-medium text-sm ${
                  activeTab === 'profile' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
          </nav>
        </div>

        {/* Job Filter (for kanban view) */}
        {activeTab === 'kanban' && (
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Jobs - Combined View</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.name} - {job.company}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
  <DashboardOverview 
    jobs={jobs} 
    tasks={tasks} 
    meetings={meetings} 
    updates={updates}
    setUpdates={setUpdates} 
    stickyNotes={stickyNotes}
    currentTask={currentTask}
    pausedTasks={pausedTasks}
    lastTask={lastTask}
    analyticsJobId={analyticsJobId}
    onStickyNoteAdd={handleAddStickyNote}
    onStickyNoteDelete={handleDeleteStickyNote}
    onStickyNoteEdit={handleEditStickyNote}
    onTaskControl={handleTaskControl}        // Add this
    onStartTask={handleStartTask}            // Add this
    onAnalyticsJobChange={handleAnalyticsJobChange}
  />
)}

        {activeTab === 'kanban' && (
          <KanbanBoard 
            tasks={tasks}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onTaskUpdate={handleTaskUpdate}
            onAddTask={handleAddTask}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeTab === 'timetable' && (
          <TimeTable 
            tasks={tasks}
            jobs={jobs}
          />
        )}
        {activeTab === 'profile' && (
  <ProfilePage token={localStorage.getItem('token')} />
)}

      </div>
    </div></div>
    </AIInsightsProvider>
  );
};

export default App;