import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const TaskAnalytics = ({ tasks, jobs, selectedJobId, onJobChange }) => {
  // Filter tasks by job if selected
  const filteredTasks = selectedJobId 
    ? tasks.filter(task => task.jobId === selectedJobId)
    : tasks;

  // Calculate task distribution
  const taskStats = {
    todo: filteredTasks.filter(task => task.status === 'todo').length,
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress').length,
    done: filteredTasks.filter(task => task.status === 'done').length
  };

  // Data for pie chart - only include categories with tasks
  const pieData = [
    { name: 'To Do', value: taskStats.todo, color: '#EF4444' },
    { name: 'In Progress', value: taskStats['in-progress'], color: '#F59E0B' },
    { name: 'Done', value: taskStats.done, color: '#10B981' }
  ].filter(item => item.value > 0);

  // Priority distribution
  const priorityStats = {
    high: filteredTasks.filter(task => task.priority === 'high').length,
    medium: filteredTasks.filter(task => task.priority === 'medium').length,
    low: filteredTasks.filter(task => task.priority === 'low').length
  };

  const priorityData = [
    { name: 'High Priority', value: priorityStats.high, color: '#EF4444' },
    { name: 'Medium Priority', value: priorityStats.medium, color: '#F59E0B' },
    { name: 'Low Priority', value: priorityStats.low, color: '#10B981' }
  ].filter(item => item.value > 0);

  // Job distribution for bar chart
  const jobDistribution = jobs.map(job => {
    const jobTasks = filteredTasks.filter(task => task.jobId === job.id);
    return {
      name: job.name,
      company: job.company,
      total: jobTasks.length,
      todo: jobTasks.filter(task => task.status === 'todo').length,
      inProgress: jobTasks.filter(task => task.status === 'in-progress').length,
      done: jobTasks.filter(task => task.status === 'done').length,
      color: job.color
    };
  }).filter(job => job.total > 0);

  const totalTasks = filteredTasks.length;
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // Calculate completion percentage
  const completionRate = totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0;

  // Calculate overdue tasks
  const overdueTasks = filteredTasks.filter(task => {
    return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  }).length;

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalTasks > 0 ? Math.round((data.value / totalTasks) * 100) : 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} task{data.value !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{data.company}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">Total: {data.total} tasks</p>
            <p className="text-xs text-red-600">To Do: {data.todo}</p>
            <p className="text-xs text-yellow-600">In Progress: {data.inProgress}</p>
            <p className="text-xs text-green-600">Done: {data.done}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Task Analytics</h3>
        </div>
        
        {/* Job selector */}
        <select
          value={selectedJobId || ''}
          onChange={(e) => onJobChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.name} - {job.company}
            </option>
          ))}
        </select>
      </div>

      {totalTasks === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tasks found</p>
          <p className="text-sm">
            {selectedJob ? `No tasks for ${selectedJob.name}` : 'Create some tasks to see analytics'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-700">{totalTasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Completion</p>
                  <p className="text-2xl font-bold text-green-700">{completionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-700">{taskStats['in-progress']}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-700">{overdueTasks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Task Status Pie Chart */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Task Status Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution Pie Chart */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Priority Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-4 mt-4">
                {priorityData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Distribution Bar Chart - only show if viewing all jobs */}
          {!selectedJobId && jobDistribution.length > 1 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Tasks by Job</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskAnalytics;