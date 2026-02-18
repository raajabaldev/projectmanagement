'use client';

import { motion } from 'framer-motion';
import { Settings, FolderOpen, Plus, Users, LogOut, Crown, User } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    activeTab: string;
    onNewTask: () => void;
    onOpenProjects: () => void;
    onOpenSettings: () => void;
    onOpenUsers: () => void;
}

const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    tasks: 'Task Tracker',
    matrix: 'Eisenhower Matrix',
    kanban: 'Kanban Board',
    gantt: 'Gantt Chart',
    weekly: 'Weekly Schedule',
    calendar: 'Monthly Calendar',
    expenses: 'Expenses & Finance',
};

export default function Header({ activeTab, onNewTask, onOpenProjects, onOpenSettings, onOpenUsers }: HeaderProps) {
    const { settings } = useProject();
    const { currentUser, isBoss, logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                {/* Left: Logo + Title */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-800 leading-tight truncate">{settings.appName}</h1>
                        <p className="text-xs text-slate-400 font-medium">{tabLabels[activeTab] || 'Overview'}</p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* New Task */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                        onClick={onNewTask}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md shadow-purple-200 hover:shadow-purple-300 transition-all"
                    >
                        <Plus size={15} />
                        <span className="hidden sm:inline">New Task</span>
                    </motion.button>

                    {/* Users — boss only */}
                    {isBoss && (
                        <motion.button
                            whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.9 }}
                            onClick={onOpenUsers}
                            title="Manage Employees"
                            className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                            <Users size={17} />
                        </motion.button>
                    )}

                    {/* Projects */}
                    <motion.button
                        whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.9 }}
                        onClick={onOpenProjects}
                        title="Manage Projects"
                        className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                    >
                        <FolderOpen size={17} />
                    </motion.button>

                    {/* Settings */}
                    <motion.button
                        whileHover={{ scale: 1.1, y: -1, rotate: 30 }} whileTap={{ scale: 0.9 }}
                        onClick={onOpenSettings}
                        title="Settings"
                        className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <Settings size={17} />
                    </motion.button>

                    {/* User badge + logout */}
                    {currentUser && (
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-semibold text-slate-700 leading-tight">{currentUser.name.split(' ')[0]}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{currentUser.employeeId}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${currentUser.role === 'boss' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-purple-400 to-indigo-500'}`}>
                                {currentUser.role === 'boss' ? <Crown size={16} /> : currentUser.name.slice(0, 2).toUpperCase()}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={logout}
                                title="Logout"
                                className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            >
                                <LogOut size={16} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
