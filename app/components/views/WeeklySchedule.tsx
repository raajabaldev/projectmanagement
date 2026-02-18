'use client';

import { motion } from 'framer-motion';
import { useProject } from '../../context/ProjectContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 0]; // getDay() values (0=Sunday)

export default function WeeklySchedule() {
    const { tasks } = useProject();

    // Get the current week's Mon-Sun dates
    const now = new Date('2026-02-18');
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekDates = DAYS.map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const getTasksForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(t => t.dueDate === dateStr);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-lg font-bold text-slate-700 mb-4">📆 Weekly Schedule</h2>
            <div className="grid grid-cols-7 gap-3">
                {DAYS.map((day, i) => {
                    const date = weekDates[i];
                    const dayTasks = getTasksForDate(date);
                    const isToday = date.toISOString().split('T')[0] === '2026-02-18';

                    return (
                        <motion.div
                            key={day}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className={`rounded-3xl p-4 min-h-[300px] shadow-xl ${isToday ? 'shadow-purple-100 bg-gradient-to-b from-purple-50 to-white border-2 border-purple-200' : 'shadow-indigo-50 bg-white border border-slate-100'}`}
                        >
                            <div className="mb-3">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-purple-500' : 'text-slate-400'}`}>{day.slice(0, 3)}</p>
                                <p className={`text-2xl font-bold ${isToday ? 'text-purple-600' : 'text-slate-700'}`}>
                                    {date.getDate()}
                                </p>
                                {isToday && <span className="text-[10px] font-bold text-purple-400 bg-purple-100 px-2 py-0.5 rounded-full">Today</span>}
                            </div>

                            <div className="space-y-2">
                                {dayTasks.length === 0 ? (
                                    <p className="text-[11px] text-slate-200 text-center py-4">Free day ✨</p>
                                ) : (
                                    dayTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            whileHover={{ scale: 1.03 }}
                                            className="rounded-xl p-2 text-[10px] font-medium"
                                            style={{ backgroundColor: task.projectColor + '22', color: task.projectColor }}
                                        >
                                            <p className="font-semibold leading-tight">{task.name}</p>
                                            <p className="opacity-70 mt-0.5">{task.project.split(' ')[0]}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
