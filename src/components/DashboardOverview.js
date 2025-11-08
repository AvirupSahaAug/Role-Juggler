// components/DashboardOverview.js - Enhanced Main Dashboard Component
import React, { useEffect, useState } from 'react';
import { Calendar, CheckSquare, Bell } from 'lucide-react';
import TaskAnalytics from './TaskAnalytics';
import CurrentTaskTracker from './CurrentTaskTracker';
import StickyNotes from './StickyNotes';
import { emailsAPI, meetingsAPI } from '../services/api';

const getPriorityTextColor = (priority) => {
  switch (priority) {
    case 'high': return 'text-red-700 bg-red-100';
    case 'medium': return 'text-yellow-700 bg-yellow-100';
    case 'low': return 'text-green-700 bg-green-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

const DashboardOverview = ({ 
  jobs, 
  tasks, 
  meetings, 
  updates, 
  setUpdates,
  stickyNotes, 
  currentTask, 
  pausedTasks = [],
  lastTask,
  analyticsJobId,
  onStickyNoteAdd,
  onStickyNoteDelete,
  onStickyNoteEdit,
  onTaskControl,
  onStartTask,
  onAnalyticsJobChange,
  token
}) => {
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
    // Fix: Get today's date in local timezone properly
  const getTodayDateString = () => {
    const now = new Date();
    // Convert to YYYY-MM-DD in local timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getTodayDateString(); // This will be correct local date
  console.log(today);

  // Filter today's tasks
  const todayTasks = tasks.filter(task => task.deadline === today);

  // Fetch meetings and updates
  const fetchMeetings = async () => {
    try {
      const res = await meetingsAPI.getAll();
      setAllMeetings(res.data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  
  const fetchEmailUpdates = async () => {
    try {
      const res = await emailsAPI.fetchToday(token);
      setUpdates(prev => {
        const existingIds = new Set(prev.map(u => u.id));
        const newOnes = (res.data || []).filter(u => !existingIds.has(u.id));
        return [...newOnes, ...prev];
      });
      // Refresh meetings after fetching emails (in case new meetings were added)
      fetchMeetings();
    } catch (error) {
      console.error('Error fetching email updates:', error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchEmailUpdates();
    
    const interval = setInterval(() => {
      fetchMeetings();
      fetchEmailUpdates();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Row - Main Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Meetings Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Today's Meetings
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {todayMeetings.length}
            </span>
          </div>
          
          {/* <div className="space-y-3 max-h-64 overflow-y-auto">
            {todayMeetings.length > 0 ? (
              todayMeetings.map(meeting => {
                const job = jobs.find(j => j.id === meeting.job_id);
                return (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{meeting.title}</p>
                      <p className="text-sm text-gray-600">{meeting.company || job?.company}</p>
                      <p className="text-xs text-gray-500">
                        {meeting.meeting_time} • {meeting.duration}min
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: job?.color || '#3B82F6' }}
                        title={job?.name}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No meetings scheduled for today</p>
              </div>
            )}
          </div>
        </div> */}
        {/* Upcoming Meetings Card */}
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-green-600" />
        Upcoming Meetings
      </h3>
      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {allMeetings.filter(m => m.meeting_date !== today).length}
      </span>
    </div>
    
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {allMeetings.filter(m => m.meeting_date !== today).length > 0 ? (
        allMeetings
          .filter(m => m.meeting_date !== today)
          .slice(0, 5) // Show only next 5 upcoming meetings
          .map(meeting => {
            const job = jobs.find(j => j.id === meeting.job_id);
            return (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{meeting.title}</p>
                  <p className="text-sm text-gray-600">{meeting.company || job?.company}</p>
                  <p className="text-xs text-gray-500">
                    {meeting.meeting_date} • {meeting.meeting_time}
                  </p>
                </div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: job?.color || '#3B82F6' }}
                  title={job?.name}
                />
              </div>
            );
          })
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>No upcoming meetings</p>
        </div>
      )}
    </div>
  </div>
</div>

        {/* Today's Tasks Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
              Today's Tasks
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {todayTasks.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => {
                const job = jobs.find(j => j.id === task.job_id);
                const isCurrentTask = currentTask && currentTask.id === task.id;
                const isPausedTask = pausedTasks.some(pt => pt.id === task.id);
                
                return (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                      isCurrentTask ? 'bg-green-50 border border-green-200' :
                      isPausedTask ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-800">{task.title}</p>
                        {isCurrentTask && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                        {isPausedTask && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{job?.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityTextColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: job?.color }}
                        title={job?.name}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tasks due today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Updates Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-600" />
              Recent Updates
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {updates.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {updates.length > 0 ? (
              updates.map(update => (
                <div key={update.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-medium text-gray-800">{update.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{update.sender || update.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {new Date(update.received_at).toLocaleDateString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      update.type === 'task' ? 'bg-blue-100 text-blue-700' :
                      update.type === 'meeting' ? 'bg-green-100 text-green-700' :
                      update.type === 'email' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {update.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent updates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row - Analytics and Task Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskAnalytics 
          tasks={tasks}
          jobs={jobs}
          selectedJobId={analyticsJobId}
          onJobChange={onAnalyticsJobChange}
        />
        <CurrentTaskTracker 
          currentTask={currentTask}
          pausedTasks={pausedTasks}
          lastTask={lastTask}
          jobs={jobs}
          tasks={tasks}
          stickyNotes={stickyNotes}
          onTaskControl={onTaskControl}
          onStartTask={onStartTask}
        />
      </div>

      {/* Third Row - Sticky Notes */}
      <StickyNotes 
        notes={stickyNotes}
        onAddNote={onStickyNoteAdd}
        onDeleteNote={onStickyNoteDelete}
        onEditNote={onStickyNoteEdit}
      />
    </div>
    
  );
};

export default DashboardOverview;