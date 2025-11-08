import React, { useState } from 'react';
import { Plus, MoreVertical, Clock, Calendar, Flag, X, Edit3, Trash2, Building2, Play, Timer } from 'lucide-react';

// Import your mock data
import { mockJobs, mockTasks } from '../data/mockData';

// Job Management Modal Component
const JobModal = ({ isOpen, onClose, onSave, editingJob }) => {
  const [jobData, setJobData] = useState({
    name: editingJob?.name || '',
    company: editingJob?.company || '',
    color: editingJob?.color || '#3B82F6'
  });

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const handleSave = () => {
    if (jobData.name.trim() && jobData.company.trim()) {
      onSave({
        id: editingJob?.id || Date.now(),
        ...jobData
      });
      setJobData({ name: '', company: '', color: '#3B82F6' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {editingJob ? 'Edit Job' : 'Add New Job'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={jobData.name}
              onChange={(e) => setJobData({ ...jobData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={jobData.company}
              onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Tech Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  onClick={() => setJobData({ ...jobData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    jobData.color === color ? 'border-gray-600' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={jobData.color}
              onChange={(e) => setJobData({ ...jobData, color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {editingJob ? 'Update Job' : 'Add Job'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Job Item Component
const JobItem = ({ job, isSelected, onClick, onEdit, onDelete, taskCount }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: job.color }}
        />
        <div>
          <h4 className="font-medium text-gray-800">{job.name}</h4>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {taskCount} tasks
        </span>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Task Card Component with your tracking features
const TaskCard = ({ task, job, onTaskUpdate, onStartTimer }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const handleStatusChange = (newStatus) => {
    onTaskUpdate(task.id, { status: newStatus });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date() && task.status !== 'done';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow duration-200">
      {/* Task header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-800 flex-1 pr-2">{task.title}</h4>
        <div className="flex items-center space-x-1">
          {/* Priority badge */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityTextColor(task.priority)}`}>
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </span>
        </div>
      </div>

      {/* Job info */}
      {job && (
        <div className="flex items-center mb-3">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: job.color }}
          />
          <span className="text-sm text-gray-600">{job.name} - {job.company}</span>
        </div>
      )}

      {/* Time tracking info */}
      {task.totalTimeSpent > 0 && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Timer className="w-4 h-4 mr-1" />
          <span>Total: {formatTime(task.totalTimeSpent)}</span>
          {task.lastWorkedOn && (
            <span className="ml-2 text-xs">
              Last: {new Date(task.lastWorkedOn).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {task.insights && task.insights.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{task.insights.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.insights.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Deadline */}
      {task.deadline && (
        <div className={`flex items-center text-sm mb-3 ${
          isOverdue(task.deadline) ? 'text-red-600' : 'text-gray-500'
        }`}>
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(task.deadline)}</span>
          {isOverdue(task.deadline) && (
            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              Overdue
            </span>
          )}
        </div>
      )}

      {/* Insights preview */}
      {task.insights && task.insights.blockers && task.insights.blockers.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 rounded text-xs">
          <span className="font-medium text-red-700">Blocked:</span>
          <span className="text-red-600 ml-1">{task.insights.blockers[0]}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {task.status !== 'todo' && (
            <button
              onClick={() => handleStatusChange('todo')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              To Do
            </button>
          )}
          {task.status !== 'in-progress' && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            >
              In Progress
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => handleStatusChange('done')}
              className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
            >
              Done
            </button>
          )}
        </div>
        
        {/* Timer button */}
        {/* {onStartTimer && (
          <button
            onClick={() => onStartTimer(task.id)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
            title="Start timer"
          >
            <Play className="w-4 h-4" />
          </button>
        )} */}
      </div>
    </div>
  );
};

// Column Component
const KanbanColumn = ({ title, tasks, jobs, status, onTaskUpdate, onAddTask, onStartTimer }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    jobId: '',
    priority: 'medium',
    deadline: ''
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      onAddTask({
        ...newTask,
        status,
        jobId: parseInt(newTask.jobId) || null,
      });
      setNewTask({ title: '', jobId: '', priority: 'medium', deadline: '' });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'border-gray-300 bg-gray-50';
      case 'in-progress': return 'border-blue-300 bg-blue-50';
      case 'done': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`flex-1 rounded-lg border-2 p-4 ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center">
          {title}
          <span className="ml-2 bg-white px-2 py-1 rounded-full text-sm text-gray-500">
            {tasks.length}
          </span>
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          <div className="flex space-x-2 mb-2">
            <select
              value={newTask.jobId}
              onChange={(e) => setNewTask({ ...newTask, jobId: e.target.value })}
              className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Job...</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.name} - {job.company}
                </option>
              ))}
            </select>
            
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddTask}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTask({ title: '', jobId: '', priority: 'medium', deadline: '' });
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map(task => {
          const job = jobs.find(j => j.id === task.jobId);
          return (
            <TaskCard
              key={task.id}
              task={task}
              job={job}
              onTaskUpdate={onTaskUpdate}
              onStartTimer={onStartTimer}
            />
          );
        })}
        
        {tasks.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs">Click + to add a task</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Kanban Board Component with Job Management
const KanbanBoard = ({ 
  tasks = [], 
  jobs = [], 
  selectedJobId, 
  onTaskUpdate, 
  onAddTask,
  onAddJob,
  onUpdateJob,
  onDeleteJob
}) => {
  // const [jobs, setJobs] = useState(initialJobs);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [internalSelectedJobId, setInternalSelectedJobId] = useState(selectedJobId);

  // Use internal state if selectedJobId is not controlled from parent
  const currentSelectedJobId = selectedJobId !== undefined ? selectedJobId : internalSelectedJobId;

  const handleJobSelect = (jobId) => {
    if (selectedJobId === undefined) {
      setInternalSelectedJobId(jobId);
    }
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setShowJobModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobModal(true);
  };

    const handleSaveJob = async (jobData) => {
    try {
      if (editingJob) {
        await onUpdateJob(editingJob.id, jobData);
      } else {
        await onAddJob(jobData);
      }
      setShowJobModal(false);
      setEditingJob(null);
    } catch (error) {
      console.error('Error saving job:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? All associated tasks will remain but will no longer be linked to this job.')) {
      try {
        await onDeleteJob(jobId);
      } catch (error) {
        console.error('Error deleting job:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleStartTimer = (taskId) => {
    // This would integrate with your existing timer system from App.js
    console.log('Starting timer for task:', taskId);
    // You could call a parent callback here if needed
  };

  // Filter tasks based on selected job
  const filteredTasks = currentSelectedJobId 
    ? tasks.filter(task => task.jobId === currentSelectedJobId)
    : tasks;

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'done');

  const selectedJob = currentSelectedJobId ? jobs.find(job => job.id === currentSelectedJobId) : null;

  return (
    <div className="flex gap-6">
      {/* Jobs Sidebar */}
      <div className="w-80 space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Jobs
            </h2>
            <button
              onClick={handleAddJob}
              className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* All Jobs option */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all mb-3 ${
              currentSelectedJobId === null 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleJobSelect(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <div>
                <h4 className="font-medium text-gray-800">All Jobs</h4>
                <p className="text-sm text-gray-600">Combined view</p>
              </div>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {tasks.length} tasks
            </span>
          </div>

          {/* Individual jobs */}
          <div className="space-y-2">
            {jobs.map(job => (
              <JobItem
                key={job.id}
                job={job}
                isSelected={currentSelectedJobId === job.id}
                onClick={() => handleJobSelect(job.id)}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
                taskCount={tasks.filter(task => task.jobId === job.id).length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 space-y-6">
        {/* Board Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedJob ? `${selectedJob.name} - ${selectedJob.company}` : 'All Jobs - Combined View'}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredTasks.length} total tasks • {todoTasks.length} to do • {inProgressTasks.length} in progress • {doneTasks.length} completed
              </p>
            </div>
            
            {selectedJob && (
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedJob.color }}
              />
            )}
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="flex space-x-6 min-h-96">
          <KanbanColumn
            title="To Do"
            status="todo"
            tasks={todoTasks}
            jobs={jobs}
            onTaskUpdate={onTaskUpdate}
            onAddTask={onAddTask}
            onStartTimer={handleStartTimer}
          />
          
          <KanbanColumn
            title="In Progress"
            status="in-progress"
            tasks={inProgressTasks}
            jobs={jobs}
            onTaskUpdate={onTaskUpdate}
            onAddTask={onAddTask}
            onStartTimer={handleStartTimer}
          />
          
          <KanbanColumn
            title="Done"
            status="done"
            tasks={doneTasks}
            jobs={jobs}
            onTaskUpdate={onTaskUpdate}
            onAddTask={onAddTask}
            onStartTimer={handleStartTimer}
          />
        </div>
      </div>

      {/* Job Modal */}
      <JobModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSave={handleSaveJob}
        editingJob={editingJob}
      />
    </div>
  );
};

export default KanbanBoard;