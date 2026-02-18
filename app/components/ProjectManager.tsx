'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Check, FolderOpen } from 'lucide-react';
import { useProject, Project } from '../context/ProjectContext';
import ConfirmDialog from './ConfirmDialog';

const COLOR_SWATCHES = [
    '#C084FC', '#6EE7B7', '#FDA4AF', '#7DD3FC', '#FCD34D',
    '#F9A8D4', '#86EFAC', '#67E8F9', '#FCA5A5', '#A5B4FC',
    '#34D399', '#FB923C', '#60A5FA', '#E879F9', '#4ADE80',
];

interface ProjectManagerProps {
    open: boolean;
    onClose: () => void;
}

export default function ProjectManager({ open, onClose }: ProjectManagerProps) {
    const { projects, tasks, addProject, editProject, deleteProject } = useProject();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#C084FC');
    const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

    const startEdit = (p: Project) => {
        setEditingId(p.id);
        setEditName(p.name);
        setEditColor(p.color);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            editProject({ id: editingId, name: editName.trim(), color: editColor });
        }
        setEditingId(null);
    };

    const handleAdd = () => {
        if (!newName.trim()) return;
        addProject({ name: newName.trim(), color: newColor });
        setNewName('');
        setNewColor('#C084FC');
    };

    const handleDelete = (p: Project) => {
        const taskCount = tasks.filter(t => t.project === p.name).length;
        if (taskCount > 0) {
            setConfirmDelete(p);
        } else {
            deleteProject(p.id);
        }
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[80]"
                            style={{ backgroundColor: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[85] shadow-2xl shadow-slate-300 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                                        <FolderOpen size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800">Manage Projects</h2>
                                        <p className="text-xs text-slate-400">{projects.length} projects</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>

                            {/* Project List */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                                {projects.map(p => {
                                    const taskCount = tasks.filter(t => t.project === p.name).length;
                                    const isEditing = editingId === p.id;
                                    return (
                                        <motion.div
                                            key={p.id}
                                            layout
                                            className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
                                        >
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                                                        autoFocus
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        {COLOR_SWATCHES.map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => setEditColor(c)}
                                                                className={`w-7 h-7 rounded-full transition-transform ${editColor === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <motion.button whileTap={{ scale: 0.95 }} onClick={saveEdit}
                                                            className="flex-1 py-2 rounded-xl bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1">
                                                            <Check size={13} /> Save
                                                        </motion.button>
                                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditingId(null)}
                                                            className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-600 text-xs font-semibold">
                                                            Cancel
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-700 text-sm truncate">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{taskCount} task{taskCount !== 1 ? 's' : ''}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => startEdit(p)}
                                                            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-500 hover:border-purple-200 transition-colors">
                                                            <Pencil size={13} />
                                                        </motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(p)}
                                                            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors">
                                                            <Trash2 size={13} />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Add New Project */}
                            <div className="px-6 py-5 border-t border-slate-100 bg-white">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add New Project</p>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="Project name…"
                                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all mb-3"
                                />
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {COLOR_SWATCHES.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setNewColor(c)}
                                            className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleAdd}
                                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md shadow-purple-200 flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Create Project
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={!!confirmDelete}
                title="Delete Project?"
                message={`"${confirmDelete?.name}" has ${tasks.filter(t => t.project === confirmDelete?.name).length} tasks. The project will be deleted but tasks will remain.`}
                confirmLabel="Delete Project"
                onConfirm={() => { if (confirmDelete) deleteProject(confirmDelete.id); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
        </>
    );
}
