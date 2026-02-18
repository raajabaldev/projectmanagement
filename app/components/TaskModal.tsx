'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useProject, Task, Priority, Status } from '../context/ProjectContext';

interface TaskModalProps {
    open: boolean;
    task?: Task | null;
    onClose: () => void;
}

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: Status[] = ['To Do', 'In Progress', 'Review', 'Done'];

const emptyForm = (): Omit<Task, 'id'> => ({
    name: '',
    description: '',
    project: '',
    projectColor: '#C084FC',
    assignees: [],
    priority: 'Medium',
    status: 'To Do',
    progress: 0,
    urgent: false,
    important: false,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
});

export default function TaskModal({ open, task, onClose }: TaskModalProps) {
    const { projects, addTask, editTask } = useProject();
    const [form, setForm] = useState<Omit<Task, 'id'>>(emptyForm());
    const [assigneeInput, setAssigneeInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEdit = !!task;

    useEffect(() => {
        if (task) {
            const { id: _id, ...rest } = task;
            setForm(rest);
        } else {
            setForm(emptyForm());
        }
        setErrors({});
        setAssigneeInput('');
    }, [task, open]);

    const handleProjectChange = (name: string) => {
        const proj = projects.find(p => p.name === name);
        setForm(f => ({ ...f, project: name, projectColor: proj?.color ?? '#C084FC' }));
    };

    const addAssignee = () => {
        const trimmed = assigneeInput.trim().toUpperCase().slice(0, 2);
        if (trimmed && !form.assignees.includes(trimmed)) {
            setForm(f => ({ ...f, assignees: [...f.assignees, trimmed] }));
        }
        setAssigneeInput('');
    };

    const removeAssignee = (a: string) =>
        setForm(f => ({ ...f, assignees: f.assignees.filter(x => x !== a) }));

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Task name is required';
        if (!form.project) e.project = 'Please select a project';
        if (!form.dueDate) e.dueDate = 'Due date is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        if (isEdit && task) {
            editTask({ ...form, id: task.id });
        } else {
            addTask(form);
        }
        onClose();
    };

    const priorityColors: Record<Priority, string> = {
        Low: 'bg-slate-100 text-slate-500',
        Medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        High: 'bg-orange-50 text-orange-500 border-orange-200',
        Critical: 'bg-rose-50 text-rose-500 border-rose-200',
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl shadow-slate-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{isEdit ? '✏️ Edit Task' : '✨ New Task'}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{isEdit ? 'Update task details' : 'Add a new task to your project'}</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {/* Body */}
                        <div className="px-7 py-5 space-y-5">
                            {/* Task Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Task Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Design landing page"
                                    className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all ${errors.name ? 'border-rose-300' : 'border-slate-200'}`}
                                />
                                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="What needs to be done?"
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all resize-none"
                                />
                            </div>

                            {/* Project + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Project *</label>
                                    <select
                                        value={form.project}
                                        onChange={e => handleProjectChange(e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all ${errors.project ? 'border-rose-300' : 'border-slate-200'}`}
                                    >
                                        <option value="">Select project…</option>
                                        {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                    </select>
                                    {errors.project && <p className="text-xs text-rose-500 mt-1">{errors.project}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Priority</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {PRIORITIES.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setForm(f => ({ ...f, priority: p }))}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${form.priority === p ? priorityColors[p] + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                                <div className="flex gap-2 flex-wrap">
                                    {STATUSES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setForm(f => ({ ...f, status: s }))}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${form.status === s ? 'bg-purple-500 text-white shadow-md shadow-purple-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Due Date *</label>
                                    <input
                                        type="date"
                                        value={form.dueDate}
                                        onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                        className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all ${errors.dueDate ? 'border-rose-300' : 'border-slate-200'}`}
                                    />
                                    {errors.dueDate && <p className="text-xs text-rose-500 mt-1">{errors.dueDate}</p>}
                                </div>
                            </div>

                            {/* Assignees */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Assignees (initials)</label>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {form.assignees.map(a => (
                                        <span key={a} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">
                                            {a}
                                            <button onClick={() => removeAssignee(a)} className="hover:text-rose-500 transition-colors"><X size={10} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={assigneeInput}
                                        onChange={e => setAssigneeInput(e.target.value.toUpperCase().slice(0, 2))}
                                        onKeyDown={e => e.key === 'Enter' && addAssignee()}
                                        placeholder="e.g. JD"
                                        maxLength={2}
                                        className="flex-1 px-4 py-2 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={addAssignee}
                                        className="px-4 py-2 rounded-2xl bg-purple-100 text-purple-600 text-sm font-semibold hover:bg-purple-200 transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add
                                    </motion.button>
                                </div>
                            </div>

                            {/* Flags */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Eisenhower Flags</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setForm(f => ({ ...f, urgent: !f.urgent }))}
                                        className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold border-2 transition-all ${form.urgent ? 'bg-rose-50 text-rose-500 border-rose-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                    >
                                        🔥 Urgent
                                    </button>
                                    <button
                                        onClick={() => setForm(f => ({ ...f, important: !f.important }))}
                                        className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold border-2 transition-all ${form.important ? 'bg-purple-50 text-purple-500 border-purple-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                    >
                                        ⭐ Important
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-7 py-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-3xl">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={15} />
                                {isEdit ? 'Save Changes' : 'Create Task'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
