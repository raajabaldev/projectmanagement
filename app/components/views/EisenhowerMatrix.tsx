'use client';

import { motion } from 'framer-motion';
import { useProject, Task } from '../../context/ProjectContext';

const quadrants = [
    { key: 'do', label: 'Do First', emoji: '🔥', desc: 'Urgent & Important', urgent: true, important: true, color: '#FDA4AF', bg: '#FFF1F2', border: '#FECDD3' },
    { key: 'schedule', label: 'Schedule', emoji: '📅', desc: 'Not Urgent & Important', urgent: false, important: true, color: '#C084FC', bg: '#FAF5FF', border: '#E9D5FF' },
    { key: 'delegate', label: 'Delegate', emoji: '🤝', desc: 'Urgent & Not Important', urgent: true, important: false, color: '#7DD3FC', bg: '#F0F9FF', border: '#BAE6FD' },
    { key: 'delete', label: 'Eliminate', emoji: '🗑️', desc: 'Not Urgent & Not Important', urgent: false, important: false, color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0' },
];

function TaskChip({ task }: { task: Task }) {
    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-slate-100 mb-2"
        >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.projectColor }} />
                <p className="text-xs font-medium text-slate-700 leading-tight">{task.name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: task.projectColor + '22', color: task.projectColor }}>
                    {task.project.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400">{task.dueDate}</span>
            </div>
        </motion.div>
    );
}

export default function EisenhowerMatrix() {
    const { tasks } = useProject();

    // Only show active (non-Done) tasks — matrix is for prioritizing work, not reviewing completed items
    const activeTasks = tasks.filter(t => t.status !== 'Done');
    const doneCount = tasks.length - activeTasks.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-700">🎯 Eisenhower Matrix</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-300 inline-block" />Urgent</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-300 inline-block" />Important</span>
                    {doneCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-500 font-semibold">
                            ✓ {doneCount} completed hidden
                        </span>
                    )}
                </div>
            </div>

            {/* Axis Labels */}
            <div className="relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-400 flex gap-16">
                    <span>← Not Urgent</span>
                    <span>Urgent →</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                {quadrants.map(q => {
                    const qTasks = activeTasks.filter(t => t.urgent === q.urgent && t.important === q.important);
                    return (
                        <motion.div
                            key={q.key}
                            whileHover={{ y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="rounded-3xl p-5 shadow-xl shadow-indigo-50 min-h-[220px]"
                            style={{ backgroundColor: q.bg, border: `1.5px solid ${q.border}` }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">{q.emoji}</span>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">{q.label}</p>
                                    <p className="text-[11px] text-slate-400">{q.desc}</p>
                                </div>
                                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: q.color + '33', color: q.color }}>
                                    {qTasks.length}
                                </span>
                            </div>
                            <div className="space-y-0">
                                {qTasks.length === 0 ? (
                                    <p className="text-xs text-slate-300 text-center py-4">No tasks here ✨</p>
                                ) : (
                                    qTasks.map(t => <TaskChip key={t.id} task={t} />)
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
