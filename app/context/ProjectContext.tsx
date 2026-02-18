'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type ViewTab = 'dashboard' | 'tasks' | 'matrix' | 'kanban' | 'gantt' | 'weekly' | 'calendar';

export interface Task {
  id: string;
  name: string;
  project: string;
  projectColor: string;
  assignees: string[];
  priority: Priority;
  status: Status;
  progress: number;
  urgent: boolean;
  important: boolean;
  startDate: string;
  dueDate: string;
  description: string;
  ownerId?: string; // user id of the creator/owner
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  appName: string;
  defaultView: ViewTab;
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Project Manager',
  defaultView: 'dashboard',
};

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Redesign', color: '#C084FC' },
  { id: 'p2', name: 'Mobile App', color: '#6EE7B7' },
  { id: 'p3', name: 'Marketing Campaign', color: '#FDA4AF' },
  { id: 'p4', name: 'Data Analytics', color: '#7DD3FC' },
  { id: 'p5', name: 'Infrastructure', color: '#FCD34D' },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'T001', name: 'Design new homepage layout', project: 'Website Redesign', projectColor: '#C084FC',
    assignees: ['AK', 'BL'], priority: 'High', status: 'In Progress', progress: 65,
    urgent: true, important: true, startDate: '2026-02-01', dueDate: '2026-02-20', description: 'Redesign the homepage with new brand guidelines', ownerId: 'u2'
  },
  {
    id: 'T002', name: 'Implement auth flow', project: 'Mobile App', projectColor: '#6EE7B7',
    assignees: ['CM'], priority: 'Critical', status: 'In Progress', progress: 40,
    urgent: true, important: true, startDate: '2026-02-03', dueDate: '2026-02-18', description: 'OAuth2 + biometric authentication', ownerId: 'u3'
  },
  {
    id: 'T003', name: 'Write Q1 blog posts', project: 'Marketing Campaign', projectColor: '#FDA4AF',
    assignees: ['DN', 'EO'], priority: 'Medium', status: 'To Do', progress: 0,
    urgent: false, important: true, startDate: '2026-02-10', dueDate: '2026-02-28', description: 'SEO-optimized blog content for Q1', ownerId: 'u4'
  },
  {
    id: 'T004', name: 'Set up data pipeline', project: 'Data Analytics', projectColor: '#7DD3FC',
    assignees: ['FP'], priority: 'High', status: 'Review', progress: 85,
    urgent: true, important: true, startDate: '2026-01-25', dueDate: '2026-02-19', description: 'ETL pipeline for analytics dashboard', ownerId: 'u3'
  },
  {
    id: 'T005', name: 'Migrate to Kubernetes', project: 'Infrastructure', projectColor: '#FCD34D',
    assignees: ['GQ', 'HR'], priority: 'Critical', status: 'In Progress', progress: 55,
    urgent: true, important: true, startDate: '2026-02-05', dueDate: '2026-02-25', description: 'Container orchestration migration', ownerId: 'u1'
  },
  {
    id: 'T006', name: 'Create social media assets', project: 'Marketing Campaign', projectColor: '#FDA4AF',
    assignees: ['IS'], priority: 'Low', status: 'Done', progress: 100,
    urgent: false, important: false, startDate: '2026-01-28', dueDate: '2026-02-10', description: 'Instagram and Twitter graphics', ownerId: 'u4'
  },
  {
    id: 'T007', name: 'API performance optimization', project: 'Mobile App', projectColor: '#6EE7B7',
    assignees: ['JT', 'KU'], priority: 'High', status: 'To Do', progress: 0,
    urgent: false, important: true, startDate: '2026-02-15', dueDate: '2026-03-05', description: 'Reduce API response time by 40%', ownerId: 'u3'
  },
  {
    id: 'T008', name: 'User testing sessions', project: 'Website Redesign', projectColor: '#C084FC',
    assignees: ['LV'], priority: 'Medium', status: 'To Do', progress: 10,
    urgent: true, important: false, startDate: '2026-02-18', dueDate: '2026-02-22', description: 'Conduct 10 user testing sessions', ownerId: 'u2'
  },
  {
    id: 'T009', name: 'Dashboard analytics charts', project: 'Data Analytics', projectColor: '#7DD3FC',
    assignees: ['MW', 'NX'], priority: 'High', status: 'In Progress', progress: 70,
    urgent: false, important: true, startDate: '2026-02-08', dueDate: '2026-02-26', description: 'Interactive charts for business metrics', ownerId: 'u3'
  },
  {
    id: 'T010', name: 'SSL certificate renewal', project: 'Infrastructure', projectColor: '#FCD34D',
    assignees: ['OY'], priority: 'Critical', status: 'Done', progress: 100,
    urgent: true, important: true, startDate: '2026-02-01', dueDate: '2026-02-05', description: 'Renew expiring SSL certificates', ownerId: 'u1'
  },
  {
    id: 'T011', name: 'Email campaign automation', project: 'Marketing Campaign', projectColor: '#FDA4AF',
    assignees: ['PZ', 'QA'], priority: 'Medium', status: 'Review', progress: 90,
    urgent: false, important: false, startDate: '2026-02-06', dueDate: '2026-02-21', description: 'Automated drip email sequences', ownerId: 'u4'
  },
  {
    id: 'T012', name: 'Push notification system', project: 'Mobile App', projectColor: '#6EE7B7',
    assignees: ['RB'], priority: 'High', status: 'To Do', progress: 5,
    urgent: false, important: true, startDate: '2026-02-20', dueDate: '2026-03-10', description: 'Real-time push notifications', ownerId: 'u3'
  },
  {
    id: 'T013', name: 'Component library docs', project: 'Website Redesign', projectColor: '#C084FC',
    assignees: ['SC', 'TD'], priority: 'Low', status: 'Done', progress: 100,
    urgent: false, important: false, startDate: '2026-01-20', dueDate: '2026-02-08', description: 'Storybook documentation', ownerId: 'u2'
  },
  {
    id: 'T014', name: 'Database indexing audit', project: 'Data Analytics', projectColor: '#7DD3FC',
    assignees: ['UE'], priority: 'Medium', status: 'In Progress', progress: 45,
    urgent: true, important: false, startDate: '2026-02-12', dueDate: '2026-02-23', description: 'Optimize slow database queries', ownerId: 'u3'
  },
  {
    id: 'T015', name: 'CI/CD pipeline setup', project: 'Infrastructure', projectColor: '#FCD34D',
    assignees: ['VF', 'WG'], priority: 'High', status: 'Review', progress: 80,
    urgent: false, important: true, startDate: '2026-02-10', dueDate: '2026-02-28', description: 'GitHub Actions deployment pipeline', ownerId: 'u1'
  },
];

interface State {
  tasks: Task[];
  projects: Project[];
  settings: AppSettings;
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'EDIT_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'UPDATE_TASK_STATUS'; id: string; status: Status }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'EDIT_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'IMPORT_DATA'; state: State };

const progressMap: Record<Status, number> = {
  'To Do': 0,
  'In Progress': 50,
  'Review': 80,
  'Done': 100,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'EDIT_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id
            ? { ...t, status: action.status, progress: progressMap[action.status] }
            : t
        ),
      };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };

    case 'EDIT_PROJECT': {
      const updated = state.projects.map(p => p.id === action.project.id ? action.project : p);
      // Update tasks that reference this project
      const updatedTasks = state.tasks.map(t =>
        t.project === state.projects.find(p => p.id === action.project.id)?.name
          ? { ...t, project: action.project.name, projectColor: action.project.color }
          : t
      );
      return { ...state, projects: updated, tasks: updatedTasks };
    }

    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.id) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'IMPORT_DATA':
      return action.state;

    default:
      return state;
  }
}

const STORAGE_KEY = 'pm_antigravity_data';

function loadState(): State {
  if (typeof window === 'undefined') {
    return { tasks: DEFAULT_TASKS, projects: DEFAULT_PROJECTS, settings: DEFAULT_SETTINGS };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch { /* ignore */ }
  return { tasks: DEFAULT_TASKS, projects: DEFAULT_PROJECTS, settings: DEFAULT_SETTINGS };
}

function saveState(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

interface ProjectContextType {
  tasks: Task[];
  projects: Project[];
  settings: AppSettings;
  // Task CRUD
  addTask: (task: Omit<Task, 'id'>) => void;
  editTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: Status) => void;
  // Project CRUD
  addProject: (project: Omit<Project, 'id'>) => void;
  editProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  // Import/Export
  exportData: () => void;
  importData: (json: string) => void;
  resetData: () => void;
  // Stats
  stats: {
    total: number;
    pending: number;
    completed: number;
    inProgress: number;
    review: number;
    overallProgress: number;
  };
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Auto-save on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTask = (task: Omit<Task, 'id'>) =>
    dispatch({ type: 'ADD_TASK', task: { ...task, id: generateId('T') } });

  const editTask = (task: Task) => dispatch({ type: 'EDIT_TASK', task });

  const deleteTask = (id: string) => dispatch({ type: 'DELETE_TASK', id });

  const updateTaskStatus = (id: string, status: Status) =>
    dispatch({ type: 'UPDATE_TASK_STATUS', id, status });

  const addProject = (project: Omit<Project, 'id'>) =>
    dispatch({ type: 'ADD_PROJECT', project: { ...project, id: generateId('P') } });

  const editProject = (project: Project) => dispatch({ type: 'EDIT_PROJECT', project });

  const deleteProject = (id: string) => dispatch({ type: 'DELETE_PROJECT', id });

  const updateSettings = (settings: Partial<AppSettings>) =>
    dispatch({ type: 'UPDATE_SETTINGS', settings });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json) as State;
      dispatch({ type: 'IMPORT_DATA', state: parsed });
    } catch { alert('Invalid JSON file. Please use a valid backup file.'); }
  };

  const resetData = () =>
    dispatch({ type: 'IMPORT_DATA', state: { tasks: DEFAULT_TASKS, projects: DEFAULT_PROJECTS, settings: DEFAULT_SETTINGS } });

  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === 'Done').length;
  const pending = state.tasks.filter(t => t.status === 'To Do').length;
  const inProgress = state.tasks.filter(t => t.status === 'In Progress').length;
  const review = state.tasks.filter(t => t.status === 'Review').length;
  const overallProgress = total > 0
    ? Math.round(state.tasks.reduce((acc, t) => acc + t.progress, 0) / total)
    : 0;

  return (
    <ProjectContext.Provider value={{
      tasks: state.tasks,
      projects: state.projects,
      settings: state.settings,
      addTask, editTask, deleteTask, updateTaskStatus,
      addProject, editProject, deleteProject,
      updateSettings,
      exportData, importData, resetData,
      stats: { total, pending, completed, inProgress, review, overallProgress },
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
