'use client';

import { motion } from 'framer-motion';
import { useProject } from '../../context/ProjectContext';

function getDaysBetween(start: string, end: string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

function getOffsetDays(from: string, to: string) {
    const f = new Date(from).getTime();
    const t = new Date(to).getTime();
    return Math.max(0, Math.ceil((t - f) / (1000 * 60 * 60 * 24)));
}

export default function GanttChart() {
    const { tasks } = useProject();

    // Find overall date range
    const allDates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.dueDate)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const totalDays = getDaysBetween(minDate.toISOString().split('T')[0], maxDate.toISOString().split('T')[0]);

    // Generate week markers
    const weeks: { label: string; offset: number }[] = [];
    const cursor = new Date(minDate);
    while (cursor <= maxDate) {
        weeks.push({
            label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            offset: getOffsetDays(minDate.toISOString().split('T')[0], cursor.toISOString().split('T')[0]),
        });
        cursor.setDate(cursor.getDate() + 7);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-lg font-bold text-slate-700 mb-4">📅 Gantt Chart</h2>
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden">
                {/* Header timeline */}
                <div className="flex border-b border-slate-100 bg-slate-50">
                    <div className="w-48 flex-shrink-0 px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-slate-100">
                        Task
                    </div>
                    <div className="flex-1 relative h-10 overflow-hidden">
                        {weeks.map((w, i) => (
                            <div
                                key={i}
                                className="absolute top-0 h-full flex items-center"
                                style={{ left: `${(w.offset / totalDays) * 100}%` }}
                            >
                                <div className="h-full border-l border-slate-200" />
                                <span className="text-[10px] text-slate-400 ml-1 whitespace-nowrap">{w.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task rows */}
                {tasks.map((task, i) => {
                    const offset = getOffsetDays(minDate.toISOString().split('T')[0], task.startDate);
                    const duration = getDaysBetween(task.startDate, task.dueDate);
                    const leftPct = (offset / totalDays) * 100;
                    const widthPct = (duration / totalDays) * 100;

                    return (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ backgroundColor: '#fafafa' }}
                            className="flex items-center border-b border-slate-50 last:border-0 transition-colors"
                        >
                            <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-slate-100">
                                <p className="text-xs font-medium text-slate-700 truncate">{task.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5" style={{ color: task.projectColor }}>{task.project.split(' ')[0]}</p>
                            </div>
                            <div className="flex-1 relative h-12 flex items-center px-2">
                                {/* Grid lines */}
                                {weeks.map((w, wi) => (
                                    <div
                                        key={wi}
                                        className="absolute top-0 h-full border-l border-slate-100"
                                        style={{ left: `${(w.offset / totalDays) * 100}%` }}
                                    />
                                ))}
                                {/* Bar */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${Math.max(widthPct, 2)}%`,
                                        backgroundColor: task.projectColor,
                                        transformOrigin: 'left center',
                                    }}
                                    className="absolute h-6 rounded-full flex items-center px-2 shadow-sm"
                                >
                                    <span className="text-[9px] text-white font-semibold truncate">{task.name}</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
