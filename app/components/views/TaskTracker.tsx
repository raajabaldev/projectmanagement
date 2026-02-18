'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProject, Status, Task } from '../../context/ProjectContext';
import { ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';

const STATUSES: Status[] = ['To Do', 'In Progress', 'Review', 'Done'];

const priorityColors: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-500',
    Medium: 'bg-yellow-50 text-yellow-600',
    High: 'bg-orange-50 text-orange-500',
    Critical: 'bg-rose-50 text-rose-500',
};

const statusColors: Record<Status, string> = {
    'To Do': 'bg-slate-100 text-slate-500',
    'In Progress': 'bg-sky-50 text-sky-600',
    'Review': 'bg-purple-50 text-purple-600',
    'Done': 'bg-emerald-50 text-emerald-600',
};

// Map status → default progress so the bar always reflects reality
const statusProgressMap: Record<Status, number> = {
    'To Do': 0,
    'In Progress': 50,
    'Review': 80,
    'Done': 100,
};

function Avatar({ initials, index }: { initials: string; index: number }) {
    const colors = ['bg-purple-300', 'bg-pink-300', 'bg-sky-300', 'bg-emerald-300', 'bg-yellow-300'];
    return (
        <div className={`w-7 h-7 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white -ml-1.5 first:ml-0`}>
            {initials}
        </div>
    );
}

// Inline progress slider — click anywhere on the bar to set progress
function ProgressCell({ task }: { task: Task }) {
    const { editTask } = useProject();
    const displayProgress = task.status === 'Done' ? 100 : task.status === 'To Do' ? task.progress : task.progress;
    const [hovering, setHovering] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (task.status === 'Done') return; // Done is always 100%
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const clamped = Math.max(0, Math.min(100, pct));
        editTask({ ...task, progress: clamped });
    };

    const progress = task.status === 'Done' ? 100 : displayProgress;

    return (
        <div className="flex items-center gap-2 min-w-[110px]">
            <div
                className={`flex-1 bg-slate-100 rounded-full h-2.5 relative ${task.status !== 'Done' ? 'cursor-pointer' : ''}`}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={handleClick}
                title={task.status !== 'Done' ? 'Click to set progress' : 'Task complete'}
            >
                <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="h-2.5 rounded-full transition-all"
                    style={{ backgroundColor: task.status === 'Done' ? '#6EE7B7' : task.projectColor }}
                />
                {/* Thumb indicator on hover */}
                {hovering && task.status !== 'Done' && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow-md pointer-events-none"
                        style={{ left: `calc(${progress}% - 7px)`, borderColor: task.projectColor }}
                    />
                )}
            </div>
            <span className="text-xs font-semibold text-slate-400 w-8 text-right">{progress}%</span>
        </div>
    );
}

interface TaskTrackerProps {
    onEditTask: (task: Task) => void;
    onNewTask: () => void;
}

export default function TaskTracker({ onEditTask, onNewTask }: TaskTrackerProps) {
    const { tasks, projects, updateTaskStatus, deleteTask } = useProject();
    const [filterProject, setFilterProject] = useState('All');
    const [filterStatus, setFilterStatus] = useState<'All' | Status>('All');
    const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

    const filtered = tasks
        .filter(t => filterProject === 'All' || t.project === filterProject)
        .filter(t => filterStatus === 'All' || t.status === filterStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-slate-700">📋 All Tasks ({filtered.length})</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status filter */}
                    <div className="flex gap-1.5">
                        {(['All', ...STATUSES] as const).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s as 'All' | Status)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s ? 'bg-purple-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-purple-200'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                    {/* Project filter */}
                    <div className="relative">
                        <select
                            value={filterProject}
                            onChange={e => setFilterProject(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2 pr-8 text-sm font-medium text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                        >
                            <option value="All">All Projects</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={onNewTask}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-100 text-purple-600 text-sm font-semibold hover:bg-purple-200 transition-colors"
                    >
                        <Plus size={14} /> Add Task
                    </motion.button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">ID</th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Task Name</th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Project</th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Assignees</th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Priority</th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Status</th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 min-w-[140px]">
                                    Progress <span className="normal-case font-normal text-slate-300">(click bar)</span>
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-300 text-sm">
                                        No tasks found. <button onClick={onNewTask} className="text-purple-400 underline">Add one?</button>
                                    </td>
                                </tr>
                            )}
                            {filtered.map((task, i) => (
                                <motion.tr
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    whileHover={{ backgroundColor: '#fafafa' }}
                                    className="border-b border-slate-50 last:border-0 transition-colors group"
                                >
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-slate-400">{task.id}</span>
                                    </td>
                                    <td className="px-5 py-3.5 max-w-[200px]">
                                        <span className="text-sm font-medium text-slate-700 truncate block">{task.name}</span>
                                        {task.description && <span className="text-xs text-slate-400 truncate block">{task.description}</span>}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                            style={{ backgroundColor: task.projectColor + '22', color: task.projectColor }}
                                        >
                                            {task.project}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center">
                                            {task.assignees.map((a, idx) => (
                                                <Avatar key={idx} initials={a} index={idx} />
                                            ))}
                                            {task.assignees.length === 0 && <span className="text-xs text-slate-300">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <select
                                            value={task.status}
                                            onChange={e => updateTaskStatus(task.id, e.target.value as Status)}
                                            className={`appearance-none text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-purple-200 ${statusColors[task.status]}`}
                                        >
                                            {STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <ProgressCell task={task} />
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <motion.button
                                                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => onEditTask(task)}
                                                className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-100 transition-colors"
                                                title="Edit task"
                                            >
                                                <Pencil size={12} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => setDeleteTarget(task)}
                                                className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors"
                                                title="Delete task"
                                            >
                                                <Trash2 size={12} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Task?"
                message={`"${deleteTarget?.name}" will be permanently deleted from all views.`}
                onConfirm={() => { if (deleteTarget) deleteTask(deleteTarget.id); setDeleteTarget(null); }}
                onCancel={() => setDeleteTarget(null)}
            />
        </motion.div>
    );
}
