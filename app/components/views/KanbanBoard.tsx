'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProject, Status, Task } from '../../context/ProjectContext';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';

const COLUMNS: { status: Status; label: string; color: string; bg: string; emoji: string }[] = [
    { status: 'To Do', label: 'To Do', color: '#94A3B8', bg: '#F8FAFC', emoji: '📋' },
    { status: 'In Progress', label: 'In Progress', color: '#7DD3FC', bg: '#F0F9FF', emoji: '⚡' },
    { status: 'Review', label: 'Review', color: '#C084FC', bg: '#FAF5FF', emoji: '🔍' },
    { status: 'Done', label: 'Done', color: '#6EE7B7', bg: '#ECFDF5', emoji: '✅' },
];

const priorityDot: Record<string, string> = {
    Low: '#94A3B8',
    Medium: '#FCD34D',
    High: '#FB923C',
    Critical: '#F43F5E',
};

interface KanbanBoardProps {
    onEditTask: (task: Task) => void;
}

function KanbanCard({ task, onDragStart, onEdit, onDelete }: {
    task: Task;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="mb-3 group"
        >
            <div
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, task.id)}
                className="bg-white rounded-2xl p-4 shadow-md shadow-slate-100 border border-slate-100 cursor-grab active:cursor-grabbing relative"
            >
                {/* Action buttons — visible on hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={e => { e.stopPropagation(); onEdit(task); }}
                        className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-100"
                    >
                        <Pencil size={10} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={e => { e.stopPropagation(); onDelete(task); }}
                        className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100"
                    >
                        <Trash2 size={10} />
                    </motion.button>
                </div>

                <div className="flex items-start justify-between mb-2 pr-14">
                    <span className="text-xs font-mono text-slate-300">{task.id}</span>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityDot[task.priority] }} />
                        <span className="text-[10px] text-slate-400">{task.priority}</span>
                    </div>
                </div>
                <p className="text-sm font-semibold text-slate-700 leading-tight mb-3">{task.name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: task.projectColor + '22', color: task.projectColor }}>
                        {task.project.split(' ')[0]}
                    </span>
                    <div className="flex -space-x-1">
                        {task.assignees.slice(0, 2).map((a, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center text-white text-[8px] font-bold border border-white">
                                {a[0]}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${task.progress}%`, backgroundColor: task.projectColor }} />
                </div>
            </div>
        </motion.div>
    );
}

export default function KanbanBoard({ onEditTask }: KanbanBoardProps) {
    const { tasks, updateTaskStatus, deleteTask } = useProject();
    const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
    const dragId = useRef<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragId.current = id;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
        e.preventDefault();
        setDragOverCol(status);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
        e.preventDefault();
        if (dragId.current) {
            updateTaskStatus(dragId.current, status);
            dragId.current = null;
        }
        setDragOverCol(null);
    };

    const handleDragLeave = () => setDragOverCol(null);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-lg font-bold text-slate-700 mb-4">🗂️ Kanban Board</h2>
                <div className="grid grid-cols-4 gap-4">
                    {COLUMNS.map(col => {
                        const colTasks = tasks.filter(t => t.status === col.status);
                        const isOver = dragOverCol === col.status;
                        return (
                            <div
                                key={col.status}
                                onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleDragOver(e, col.status)}
                                onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, col.status)}
                                onDragLeave={handleDragLeave}
                                className="rounded-3xl p-4 min-h-[400px] transition-all duration-200"
                                style={{
                                    backgroundColor: isOver ? col.color + '15' : col.bg,
                                    border: isOver ? `2px dashed ${col.color}` : `1.5px solid ${col.color}22`,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <span>{col.emoji}</span>
                                    <span className="font-bold text-sm text-slate-700">{col.label}</span>
                                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: col.color + '33', color: col.color }}>
                                        {colTasks.length}
                                    </span>
                                </div>
                                <div>
                                    {colTasks.map(task => (
                                        <KanbanCard
                                            key={task.id}
                                            task={task}
                                            onDragStart={handleDragStart}
                                            onEdit={onEditTask}
                                            onDelete={t => setDeleteTarget(t)}
                                        />
                                    ))}
                                    {colTasks.length === 0 && (
                                        <div className="flex items-center justify-center h-24 text-slate-300 text-sm">
                                            Drop here
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Task?"
                message={`"${deleteTarget?.name}" will be permanently deleted.`}
                onConfirm={() => { if (deleteTarget) deleteTask(deleteTarget.id); setDeleteTarget(null); }}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}
