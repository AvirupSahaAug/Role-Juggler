// data/mockData.js - Enhanced Sample Data for Development

// Mock job/role data
export const mockJobs = [
  { id: 1, name: 'Frontend Developer', company: 'TechCorp', color: '#3B82F6' },
  { id: 2, name: 'UI/UX Consultant', company: 'DesignStudio', color: '#10B981' },
  { id: 3, name: 'React Trainer', company: 'EduTech', color: '#F59E0B' }
];

// Mock task data with enhanced tracking
export const mockTasks = [
  { 
    id: 1, 
    title: 'Fix login authentication', 
    jobId: 1, 
    priority: 'high', 
    status: 'todo', 
    deadline: '2025-09-28',
    // Task tracking data
    totalTimeSpent: 3600000, // 1 hour previously
    lastWorkedOn: Date.now() - 86400000, // 24 hours ago
    workSessions: [
      {
        startTime: Date.now() - 90000000, // 25 hours ago
        endTime: Date.now() - 86400000, // 24 hours ago  
        duration: 3600000, // 1 hour
        notes: "Started debugging authentication flow, identified JWT token expiration issue"
      }
    ],
    // AI insights (dummy data)
    insights: {
      whatWasDone: [
        "Analyzed authentication flow and JWT token handling",
        "Identified token expiration timing issue",
        "Reviewed security middleware configuration"
      ],
      whatNeedsToBeNext: [
        "Implement proper token refresh mechanism",
        "Add error handling for expired tokens",
        "Test with different user scenarios",
        "Update documentation for auth changes"
      ],
      estimatedTimeLeft: "2-3 hours",
      blockers: ["Need backend team input on refresh token strategy"],
      progress: 40 // percentage
    }
  },
  { 
    id: 2, 
    title: 'Design user dashboard', 
    jobId: 2, 
    priority: 'medium', 
    status: 'in-progress', 
    deadline: '2025-09-30',
    totalTimeSpent: 7200000, // 2 hours
    lastWorkedOn: Date.now() - 1800000, // 30 minutes ago
    workSessions: [
      {
        startTime: Date.now() - 9000000, // 2.5 hours ago
        endTime: Date.now() - 1800000, // 30 minutes ago
        duration: 7200000, // 2 hours
        notes: "Created wireframes and started UI components, working on responsive layout"
      }
    ],
    insights: {
      whatWasDone: [
        "Created initial wireframes for dashboard layout",
        "Designed user navigation flow",
        "Started building responsive grid system",
        "Implemented basic card components"
      ],
      whatNeedsToBeNext: [
        "Add interactive charts and graphs",
        "Implement dark mode toggle",
        "Create user preferences panel",
        "Add real-time data integration points"
      ],
      estimatedTimeLeft: "4-5 hours",
      blockers: [],
      progress: 60
    }
  },
  { 
    id: 3, 
    title: 'Prepare React workshop', 
    jobId: 3, 
    priority: 'high', 
    status: 'todo', 
    deadline: '2025-09-29',
    totalTimeSpent: 0,
    lastWorkedOn: null,
    workSessions: [],
    insights: {
      whatWasDone: [],
      whatNeedsToBeNext: [
        "Create workshop outline and learning objectives",
        "Prepare hands-on coding exercises",
        "Set up development environment guide",
        "Create presentation slides",
        "Prepare Q&A scenarios"
      ],
      estimatedTimeLeft: "6-8 hours",
      blockers: ["Need to confirm workshop format (online/offline)"],
      progress: 0
    }
  },
  { 
    id: 4, 
    title: 'Code review session', 
    jobId: 1, 
    priority: 'low', 
    status: 'done', 
    deadline: '2025-09-27',
    totalTimeSpent: 5400000, // 1.5 hours
    lastWorkedOn: Date.now() - 3600000, // 1 hour ago
    workSessions: [
      {
        startTime: Date.now() - 7200000, // 2 hours ago
        endTime: Date.now() - 3600000, // 1 hour ago
        duration: 5400000, // 1.5 hours
        notes: "Reviewed pull requests, provided feedback on React components and testing"
      }
    ],
    insights: {
      whatWasDone: [
        "Reviewed 5 pull requests",
        "Provided detailed feedback on component structure",
        "Suggested performance improvements",
        "Approved 3 PRs, requested changes on 2"
      ],
      whatNeedsToBeNext: [],
      estimatedTimeLeft: "0 hours",
      blockers: [],
      progress: 100
    }
  },
  { 
    id: 5, 
    title: 'Client meeting prep', 
    jobId: 2, 
    priority: 'medium', 
    status: 'in-progress', 
    deadline: '2025-09-28',
    totalTimeSpent: 1800000, // 30 minutes
    lastWorkedOn: Date.now() - 600000, // 10 minutes ago
    workSessions: [
      {
        startTime: Date.now() - 2400000, // 40 minutes ago
        endTime: Date.now() - 600000, // 10 minutes ago
        duration: 1800000, // 30 minutes
        notes: "Started gathering project updates and preparing presentation materials"
      }
    ],
    insights: {
      whatWasDone: [
        "Collected project status updates",
        "Prepared progress screenshots",
        "Listed key accomplishments from last sprint"
      ],
      whatNeedsToBeNext: [
        "Create presentation slides",
        "Prepare demo environment",
        "List discussion points and questions",
        "Gather feedback from team members"
      ],
      estimatedTimeLeft: "1-2 hours",
      blockers: ["Waiting for final designs from design team"],
      progress: 30
    }
  }
];

// Mock meeting data
export const mockMeetings = [
  { id: 1, title: 'Daily Standup', time: '09:00', jobId: 1 },
  { id: 2, title: 'Client Review', time: '14:30', jobId: 2 },
  { id: 3, title: 'Workshop Planning', time: '16:00', jobId: 3 }
];

// Mock updates/notifications
export const mockUpdates = [
  { 
    id: 1, 
    message: 'New task assigned: API Integration', 
    time: '2 hours ago', 
    type: 'task' 
  },
  { 
    id: 2, 
    message: 'Meeting rescheduled to 3:30 PM', 
    time: '4 hours ago', 
    type: 'meeting' 
  },
  { 
    id: 3, 
    message: 'Deadline extended for Dashboard Design', 
    time: '1 day ago', 
    type: 'update' 
  }
];

// Mock sticky notes
export const mockStickyNotes = [
  { 
    id: 1, 
    content: 'Remember to call client about project timeline', 
    color: '#FEF3C7' 
  },
  { 
    id: 2, 
    content: 'Code review scheduled for tomorrow 2PM', 
    color: '#DBEAFE' 
  },
  { 
    id: 3, 
    content: 'Update portfolio with recent projects', 
    color: '#D1FAE5' 
  }
];

// Current active task (only one at a time)
export const mockCurrentTask = {
  id: 2,
  title: 'Design user dashboard',
  jobId: 2,
  startTime: Date.now() - 1800000, // Started 30 minutes ago
  isActive: true,
  sessionNotes: '' // Current session notes
};

// Paused tasks (tasks that were being worked on but paused)
export const mockPausedTasks = [
  {
    id: 5,
    title: 'Client meeting prep',
    jobId: 2,
    totalTime: 1800000, // 30 minutes accumulated
    lastPaused: Date.now() - 600000, // Paused 10 minutes ago
    sessionNotes: 'Was working on gathering project updates'
  }
];

// Last completed task data
export const mockLastTask = {
  id: 4,
  title: 'Code review session',
  jobId: 1,
  duration: 5400000, // 1.5 hours
  completedAt: Date.now() - 3600000, // 1 hour ago
  sessionNotes: 'Completed review of all pending PRs'
};

// Available colors for sticky notes
export const noteColors = [
  '#FEF3C7', // Yellow
  '#DBEAFE', // Blue  
  '#D1FAE5', // Green
  '#FCE7F3', // Pink
  '#F3E8FF', // Purple
  '#FED7D7'  // Red
];