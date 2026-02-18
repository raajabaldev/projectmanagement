'use client';

import { motion } from 'framer-motion';
import { useProject } from '../../context/ProjectContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay(); // 0=Sun
}

export default function MonthlyCalendar() {
    const { tasks } = useProject();
    const [viewDate, setViewDate] = useState(new Date('2026-02-01'));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    // Adjust so Monday is first (0=Mon)
    const startOffset = (firstDay + 6) % 7;

    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const getTasksForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(t => t.dueDate === dateStr);
    };

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const today = '2026-02-18';
    const todayDay = new Date(today).getDate();
    const todayMonth = new Date(today).getMonth();
    const todayYear = new Date(today).getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-700">🗓️ Monthly Calendar</h2>
                <div className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth}
                        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-purple-500">
                        <ChevronLeft size={16} />
                    </motion.button>
                    <span className="text-sm font-bold text-slate-700 min-w-[140px] text-center">{monthName}</span>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth}
                        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-purple-500">
                        <ChevronRight size={16} />
                    </motion.button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {/* Empty cells before first day */}
                    {Array.from({ length: startOffset }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-28 border-b border-r border-slate-50 bg-slate-50/50" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayTasks = getTasksForDay(day);
                        const isToday = day === todayDay && month === todayMonth && year === todayYear;

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ backgroundColor: '#faf5ff' }}
                                className={`h-28 border-b border-r border-slate-50 p-2 transition-colors ${isToday ? 'bg-purple-50' : ''}`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${isToday ? 'bg-purple-500 text-white shadow-lg shadow-purple-200' : 'text-slate-600'
                                    }`}>
                                    {day}
                                </div>
                                <div className="space-y-0.5 overflow-hidden">
                                    {dayTasks.slice(0, 2).map(task => (
                                        <motion.div
                                            key={task.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate"
                                            style={{ backgroundColor: task.projectColor + '33', color: task.projectColor }}
                                        >
                                            {task.name}
                                        </motion.div>
                                    ))}
                                    {dayTasks.length > 2 && (
                                        <p className="text-[9px] text-slate-400 pl-1">+{dayTasks.length - 2} more</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
