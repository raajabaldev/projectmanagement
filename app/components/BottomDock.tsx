'use client';

import { motion } from 'framer-motion';
import {
    LayoutDashboard, ListTodo, Grid2X2, Columns3, GanttChartSquare, CalendarDays, Calendar, CreditCard, FileText
} from 'lucide-react';

type Tab = 'dashboard' | 'tasks' | 'matrix' | 'kanban' | 'gantt' | 'weekly' | 'calendar' | 'expenses' | 'reports';

interface BottomDockProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: React.ReactNode; label: string; color: string; glow: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', color: '#C084FC', glow: 'shadow-purple-300' },
    { id: 'tasks', icon: <ListTodo size={20} />, label: 'Tasks', color: '#6EE7B7', glow: 'shadow-emerald-300' },
    { id: 'matrix', icon: <Grid2X2 size={20} />, label: 'Matrix', color: '#FDA4AF', glow: 'shadow-rose-300' },
    { id: 'kanban', icon: <Columns3 size={20} />, label: 'Kanban', color: '#7DD3FC', glow: 'shadow-sky-300' },
    { id: 'gantt', icon: <GanttChartSquare size={20} />, label: 'Gantt', color: '#FCD34D', glow: 'shadow-yellow-300' },
    { id: 'weekly', icon: <CalendarDays size={20} />, label: 'Weekly', color: '#86EFAC', glow: 'shadow-green-300' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Calendar', color: '#F9A8D4', glow: 'shadow-pink-300' },
    { id: 'expenses', icon: <CreditCard size={20} />, label: 'Expenses', color: '#34D399', glow: 'shadow-emerald-300' },
    { id: 'reports', icon: <FileText size={20} />, label: 'Reports', color: '#818CF8', glow: 'shadow-indigo-300' },
];

export default function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
                className="flex items-center gap-1 bg-white/90 backdrop-blur-2xl rounded-full px-3 py-2.5 shadow-2xl shadow-slate-200 border border-slate-100"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            whileHover={{ scale: 1.15, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 ${isActive ? `shadow-lg ${tab.glow}` : 'hover:bg-slate-50'
                                }`}
                            style={{
                                backgroundColor: isActive ? tab.color + '22' : undefined,
                            }}
                            title={tab.label}
                        >
                            <span style={{ color: isActive ? tab.color : '#94a3b8' }}>
                                {tab.icon}
                            </span>
                            <span
                                className="text-[10px] font-semibold leading-none"
                                style={{ color: isActive ? tab.color : '#94a3b8' }}
                            >
                                {tab.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="dock-indicator"
                                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                    style={{ backgroundColor: tab.color }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
