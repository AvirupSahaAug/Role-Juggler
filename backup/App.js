// App.js - Enhanced Main Application Component
import React, { useState } from 'react';
import { Briefcase, Filter, LogOut } from 'lucide-react';

// Import all our custom components
import LoginPage from './components/LoginPage';
import DashboardOverview from './components/DashboardOverview';
import KanbanBoard from './components/KanbanBoard';
import TimeTable from './components/TimeTable';

// Import enhanced mock data
import { 
  mockJobs, 
  mockTasks, 
  mockMeetings, 
  mockUpdates, 
  mockStickyNotes,
  mockCurrentTask,
  mockPausedTasks,
  mockLastTask
} from './data/mockData';

const App = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filter states
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [analyticsJobId, setAnalyticsJobId] = useState(null);
  
  // Data states
  const [jobs] = useState(mockJobs);
  const [tasks, setTasks] = useState(mockTasks);
  const [meetings] = useState(mockMeetings);
  const [updates] = useState(mockUpdates);
  const [stickyNotes, setStickyNotes] = useState(mockStickyNotes);
  
  // Enhanced task tracking states
  const [currentTask, setCurrentTask] = useState(mockCurrentTask);
  const [pausedTasks, setPausedTasks] = useState(mockPausedTasks);
  const [lastTask, setLastTask] = useState(mockLastTask);

  // Authentication handlers
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  // Enhanced task control handlers
  const handleTaskControl = (action, taskId) => {
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
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === currentTask.id 
              ? { 
                  ...task, 
                  totalTimeSpent: (task.totalTimeSpent || 0) + sessionTime,
                  lastWorkedOn: now
                }
              : task
          )
        );
        
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
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === currentTask.id 
                ? { 
                    ...task, 
                    totalTimeSpent: (task.totalTimeSpent || 0) + sessionTime,
                    lastWorkedOn: now
                  }
                : task
            )
          );
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
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === currentTask.id 
              ? { 
                  ...task, 
                  totalTimeSpent: (task.totalTimeSpent || 0) + sessionTime,
                  lastWorkedOn: now,
                  // Add work session
                  workSessions: [
                    ...task.workSessions || [],
                    {
                      startTime: currentTask.startTime,
                      endTime: now,
                      duration: sessionTime,
                      notes: currentTask.sessionNotes || `Work session completed`
                    }
                  ]
                }
              : task
          )
        );
        
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
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    totalTimeSpent: (task.totalTimeSpent || 0) + taskToComplete.totalTime,
                    lastWorkedOn: now,
                    workSessions: [
                      ...task.workSessions || [],
                      {
                        startTime: now - taskToComplete.totalTime,
                        endTime: now,
                        duration: taskToComplete.totalTime,
                        notes: taskToComplete.sessionNotes || 'Work session completed from paused state'
                      }
                    ]
                  }
                : task
            )
          );
        }
      }
    }
  };

  // Start a new task
  const handleStartTask = (taskId) => {
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
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === currentTask.id 
            ? { 
                ...task, 
                totalTimeSpent: (task.totalTimeSpent || 0) + sessionTime,
                lastWorkedOn: now
              }
            : task
        )
      );
    }

    // Find task details
    const taskToStart = tasks.find(task => task.id === taskId);
    if (taskToStart) {
      setCurrentTask({
        id: taskId,
        title: taskToStart.title,
        jobId: taskToStart.jobId,
        startTime: now,
        isActive: true,
        sessionNotes: ''
      });

      // Update task status to in-progress if it's not already
      if (taskToStart.status !== 'in-progress') {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, status: 'in-progress' } : task
          )
        );
      }
    }
  };

  // Regular task management handlers
  const handleTaskUpdate = (taskId, updates) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleAddTask = (newTask) => {
    const task = {
      ...newTask,
      id: Date.now(),
      totalTimeSpent: 0,
      lastWorkedOn: null,
      workSessions: [],
      insights: {
        whatWasDone: [],
        whatNeedsToBeNext: [
          "Define task requirements and scope",
          "Break down into smaller subtasks",
          "Identify required resources",
          "Set up development environment if needed"
        ],
        estimatedTimeLeft: "TBD",
        blockers: [],
        progress: 0
      }
    };
    setTasks(prevTasks => [...prevTasks, task]);
  };

  // Sticky notes handlers
  const handleAddStickyNote = (noteData) => {
    const note = {
      ...noteData,
      id: Date.now()
    };
    setStickyNotes(prev => [...prev, note]);
  };

  const handleDeleteStickyNote = (noteId) => {
    setStickyNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleEditStickyNote = (noteId, updates) => {
    setStickyNotes(prev => 
      prev.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      )
    );
  };

  // Analytics filter handler
  const handleAnalyticsJobChange = (jobId) => {
    setAnalyticsJobId(jobId ? parseInt(jobId) : null);
  };

  // Show login page if user is not logged in
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
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
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
            stickyNotes={stickyNotes}
            currentTask={currentTask}
            pausedTasks={pausedTasks}
            lastTask={lastTask}
            analyticsJobId={analyticsJobId}
            onStickyNoteAdd={handleAddStickyNote}
            onStickyNoteDelete={handleDeleteStickyNote}
            onStickyNoteEdit={handleEditStickyNote}
            onTaskControl={handleTaskControl}
            onStartTask={handleStartTask}
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
          />
        )}

        {activeTab === 'timetable' && (
          <TimeTable 
            tasks={tasks}
            jobs={jobs}
          />
        )}
      </div>
    </div>
  );
};

export default App;