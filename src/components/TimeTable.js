import React, { useState } from 'react';
import { Clock, Settings, Target, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// Utility function to get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

// Utility function to get priority text color
const getPriorityTextColor = (priority) => {
  switch (priority) {
    case 'high': return 'text-red-700 bg-red-100';
    case 'medium': return 'text-yellow-700 bg-yellow-100';
    case 'low': return 'text-green-700 bg-green-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

// Utility function to format date
const formatDate = (date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dateObj = new Date(date);
  
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (dateObj.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

// Generate dates for the next 7 days
const generateWeekDates = (startDate = new Date()) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const TimeTable = ({ tasks, jobs }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Enhanced mock time allocation data with dates
  const timeSlots = [
    // Today
    { date: new Date().toISOString().split('T')[0], time: '09:00-10:30', taskId: 1, allocated: true },
    { date: new Date().toISOString().split('T')[0], time: '10:30-12:00', taskId: 2, allocated: true },
    { date: new Date().toISOString().split('T')[0], time: '14:00-15:30', taskId: 3, allocated: true },
    { date: new Date().toISOString().split('T')[0], time: '16:00-17:00', taskId: 5, allocated: true },
    
    // Tomorrow
    { date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '09:00-11:00', taskId: 3, allocated: true },
    { date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '14:00-16:00', taskId: 1, allocated: true },
    { date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '16:30-17:30', taskId: 2, allocated: true },
    
    // Day after tomorrow
    { date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], time: '10:00-12:00', taskId: 5, allocated: true },
    { date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], time: '15:00-17:00', taskId: 3, allocated: true }
  ];

  const weekDates = generateWeekDates(currentWeekStart);
  const filteredTimeSlots = timeSlots.filter(slot => slot.date === selectedDate);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
    
    // Update selected date to the first day of new week if current selection is not in the new week
    const newWeekDates = generateWeekDates(newDate);
    if (!newWeekDates.includes(selectedDate)) {
      setSelectedDate(newWeekDates[0]);
    }
  };

  const getTotalTasksForDate = (date) => {
    return timeSlots.filter(slot => slot.date === date).length;
  };

  const getTotalHoursForDate = (date) => {
    const slotsForDate = timeSlots.filter(slot => slot.date === date);
    let totalMinutes = 0;
    
    slotsForDate.forEach(slot => {
      const [start, end] = slot.time.split('-');
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      totalMinutes += endMinutes - startMinutes;
    });
    
    return totalMinutes / 60;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-blue-600" />
          Time Table Schedule
        </h3>
        <button className="text-blue-600 hover:text-blue-800 flex items-center">
          <Settings className="w-4 h-4 mr-1" />
          Auto-allocate
        </button>
      </div>

      {/* Week Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous Week
          </button>
          
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <button
            onClick={() => navigateWeek(1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            Next Week
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map(date => {
            const dateObj = new Date(date);
            const isSelected = date === selectedDate;
            const isToday = date === new Date().toISOString().split('T')[0];
            const tasksCount = getTotalTasksForDate(date);
            const totalHours = getTotalHoursForDate(date);
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${isToday ? 'bg-yellow-50' : ''}`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  isSelected ? 'text-blue-800' : isToday ? 'text-yellow-800' : 'text-gray-800'
                }`}>
                  {dateObj.getDate()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tasksCount > 0 ? `${tasksCount} tasks` : 'Free'}
                </div>
                {totalHours > 0 && (
                  <div className="text-xs text-blue-600 font-medium">
                    {totalHours}h
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Schedule */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Schedule for {formatDate(selectedDate)}
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })})
          </span>
        </h4>

        {filteredTimeSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No tasks scheduled</p>
            <p className="text-sm">This day is free for planning</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTimeSlots
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((slot, index) => {
                const task = tasks.find(t => t.id === slot.taskId);
                const job = jobs.find(j => j.id === task?.jobId);
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-mono bg-gray-100 px-3 py-2 rounded min-w-[100px] text-center">
                        {slot.time}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{task?.title}</p>
                        <p className="text-sm text-gray-600">{job?.company}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityTextColor(task?.priority)}`}>
                            {task?.priority}
                          </span>
                          {task?.deadline && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: job?.color }}
                        title={job?.name}
                      ></div>
                      <Target className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            
            {/* Daily Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-blue-700">
                    <span className="font-semibold">{filteredTimeSlots.length}</span> tasks scheduled
                  </div>
                  <div className="text-sm text-blue-700">
                    <span className="font-semibold">{getTotalHoursForDate(selectedDate)}h</span> total time
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Optimize Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTable; 