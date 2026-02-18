'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProject } from './context/ProjectContext';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import BottomDock from './components/BottomDock';
import LoginScreen from './components/LoginScreen';
import TaskModal from './components/TaskModal';
import ProjectManager from './components/ProjectManager';
import SettingsPanel from './components/SettingsPanel';
import UserManager from './components/UserManager';
import Dashboard from './components/views/Dashboard';
import TaskTracker from './components/views/TaskTracker';
import EisenhowerMatrix from './components/views/EisenhowerMatrix';
import KanbanBoard from './components/views/KanbanBoard';
import GanttChart from './components/views/GanttChart';
import WeeklySchedule from './components/views/WeeklySchedule';
import MonthlyCalendar from './components/views/MonthlyCalendar';
import ExpensesView from './components/views/ExpensesView';
import ReportsView from './components/views/ReportsView';
import { Task } from './context/ProjectContext';

type Tab = 'dashboard' | 'tasks' | 'matrix' | 'kanban' | 'gantt' | 'weekly' | 'calendar' | 'expenses' | 'reports';

export default function Home() {
  const { settings } = useProject();
  const { currentUser, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(settings.defaultView as Tab);

  // Panels
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  // Wait for auth to load from localStorage — show a blank slate to avoid
  // hydration mismatch and the "Router action before initialization" error.
  if (!initialized) {
    return <div className="min-h-screen bg-slate-50 animate-pulse" />;
  }

  // Auth loaded: show login or the main app
  if (!currentUser) {
    return <LoginScreen appName={settings.appName} />;
  }


  const openNewTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard key="dashboard" />;
      case 'tasks': return <TaskTracker key="tasks" onEditTask={openEditTask} onNewTask={openNewTask} />;
      case 'matrix': return <EisenhowerMatrix key="matrix" />;
      case 'kanban': return <KanbanBoard key="kanban" onEditTask={openEditTask} />;
      case 'gantt': return <GanttChart key="gantt" />;
      case 'weekly': return <WeeklySchedule key="weekly" />;
      case 'calendar': return <MonthlyCalendar key="calendar" />;
      case 'expenses': return <ExpensesView key="expenses" />;
      case 'reports': return <ReportsView key="reports" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        activeTab={activeTab}
        onNewTask={openNewTask}
        onOpenProjects={() => setProjectsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenUsers={() => setUsersOpen(true)}
      />

      <main className="max-w-[1400px] mx-auto px-6 py-8 pb-32">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Panels */}
      <TaskModal
        open={taskModalOpen}
        task={editingTask}
        onClose={closeTaskModal}
      />
      <ProjectManager
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
      />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <UserManager
        open={usersOpen}
        onClose={() => setUsersOpen(false)}
      />
    </div>
  );
}
