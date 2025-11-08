// CurrentTaskTracker.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Clock, Play, Pause, Square, Lightbulb, Sparkles } from 'lucide-react';
import { useAIInsights } from '../contexts/AIInsightsContext';

// Lazy load the Insights module so it's only imported/executed when needed
const Insights = lazy(() => import('./Insights'));

const CurrentTaskTracker = ({ 
  currentTask, 
  pausedTasks = [], 
  jobs = [], 
  tasks = [], 
  stickyNotes = [],
  onTaskControl,
  onStartTask
}) => {
  const [showInsights, setShowInsights] = useState(false);

  // Get job info for current task
  const currentJob = currentTask ? jobs.find(j => j.id === currentTask.jobId) : null;

  // Get task details including insights
  const getCurrentTaskDetails = () => {
    if (!currentTask) return null;
    return tasks.find(t => t.id === currentTask.id) || null;
  };

  const currentTaskDetails = getCurrentTaskDetails();

  const handleInsightsToggle = () => {
    // toggling showInsights will mount/unmount the lazy Insights component
    setShowInsights(prev => !prev);
  };

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for real-time timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format duration in a readable format
  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return '0m';
    
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format time for display (e.g., "2 hours ago")
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  // Calculate current task duration (guarded)
  const currentDuration = currentTask?.startTime
    ? (currentTime - currentTask.startTime)
    : 0;

  // Count total active tasks (current + paused)
  const totalActiveTasks = (currentTask ? 1 : 0) + pausedTasks.length;

  // Get available tasks that can be started (not current, not paused, not done)
  const getAvailableTasks = () => {
    const currentTaskId = currentTask?.id;
    const pausedTaskIds = pausedTasks.map(pt => pt.id);
    
    return tasks.filter(task => 
      task.status !== 'done' && 
      task.id !== currentTaskId && 
      !pausedTaskIds.includes(task.id)
    );
  };

  const availableTasks = getAvailableTasks();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Task Tracker ({totalActiveTasks})
        </h3>
        <div className="flex items-center space-x-2">
          {currentTask?.isActive && (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">Active</span>
            </div>
          )}
          {pausedTasks.length > 0 && (
            <div className="flex items-center text-yellow-600">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium">{pausedTasks.length} Paused</span>
            </div>
          )}

          {/* Insights Toggle Button */}
          {currentTask && (
            <button
              onClick={handleInsightsToggle}
              className={`ml-2 px-3 py-1 rounded-full text-sm flex items-center space-x-2 border transition-colors ${
                showInsights ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title="Toggle AI Insights"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showInsights ? 'Hide Insights' : 'Show Insights'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Active Task Section */}
      {currentTask && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">
              {currentTask.isActive ? 'Currently Active' : 'Current Task (Paused)'}
            </h4>
            <div className="text-xs text-gray-500">
              Started {formatTimeAgo(currentTask.startTime)}
            </div>
          </div>
          
          <div className={`border-2 rounded-lg p-4 ${
            currentTask.isActive 
              ? 'border-green-200 bg-green-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            {/* Task Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">{currentTask.title}</h5>
                {currentJob && (
                  <div className="flex items-center space-x-2">
                    <span 
                      style={{ color: currentJob.color }} 
                      className="text-sm font-medium"
                    >
                      {currentJob.company}
                    </span>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentJob.color }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  currentTask.isActive ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {formatDuration(currentDuration)}
                </p>
                <p className="text-xs text-gray-600">Current Session</p>
                {currentTaskDetails?.totalTimeSpent > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {formatDuration(currentTaskDetails.totalTimeSpent + currentDuration)}
                  </p>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onTaskControl('pause', currentTask.id)}
                  className={`p-3 rounded-full transition-colors ${
                    currentTask.isActive 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                  title={currentTask.isActive ? 'Pause' : 'Resume'}
                >
                  {currentTask.isActive ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={() => onTaskControl('stop', currentTask.id)}
                  className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Complete Session"
                >
                  <Square className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Task Insights: lazy-loaded separate module */}
            {showInsights && currentTaskDetails && (
              <Suspense fallback={
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 text-center">
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500 animate-pulse" />
                    Loading insights...
                  </div>
                </div>
              }>
                <Insights
                  currentTaskDetails={currentTaskDetails}
                  currentJob={currentJob}
                  tasks={tasks}
                  jobs={jobs}
                  stickyNotes={stickyNotes}
                />
              </Suspense>
            )}

            {/* Status Indicator */}
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                currentTask.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentTask.isActive ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Running
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Paused
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Paused Tasks Section */}
      {pausedTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Paused Tasks</h4>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              {pausedTasks.length} paused
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pausedTasks.map((task, index) => {
              const pausedJob = jobs.find(j => j.id === task.jobId);
              // prefer totalTimeSpent (consistent with other places)
              const pausedDuration = task.totalTimeSpent ?? task.totalTime ?? 0;
              
              return (
                <div key={task.id || index} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800 text-sm">{task.title}</h5>
                      {pausedJob && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span 
                            style={{ color: pausedJob.color }} 
                            className="text-xs font-medium"
                          >
                            {pausedJob.company}
                          </span>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: pausedJob.color }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onTaskControl('resume', task.id)}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        title="Resume Task"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onTaskControl('stop', task.id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Complete Task"
                      >
                        <Square className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Time worked</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDuration(pausedDuration)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Paused</p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(task.lastPaused)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Start New Task Section */}
      {!currentTask && availableTasks.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Start Working On</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTasks.slice(0, 5).map(task => {
              const job = jobs.find(j => j.id === task.jobId);
              const taskDetails = tasks.find(t => t.id === task.id);
              
              return (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onStartTask(task.id)}
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800 text-sm">{task.title}</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      {job && (
                        <>
                          <span 
                            style={{ color: job.color }} 
                            className="text-xs font-medium"
                          >
                            {job.company}
                          </span>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: job.color }}
                          ></div>
                        </>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {taskDetails?.totalTimeSpent > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Previous work: {formatDuration(taskDetails.totalTimeSpent)}
                      </p>
                    )}
                  </div>
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when no tasks */}
      {!currentTask && pausedTasks.length === 0 && availableTasks.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No Tasks Available</p>
          <p className="text-sm">Create some tasks or move tasks to "In Progress" to start working</p>
        </div>
      )}
    </div>
  );
};

export default CurrentTaskTracker;
