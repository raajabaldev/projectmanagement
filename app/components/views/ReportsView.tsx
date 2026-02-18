'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, ChevronDown, FileText, Smile } from 'lucide-react';
import { useReports, DailyReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

const MOODS = [
    { value: 'great', label: 'Great 🚀', color: '#6EE7B7', bg: '#ECFDF5' },
    { value: 'good', label: 'Good 😊', color: '#7DD3FC', bg: '#F0F9FF' },
    { value: 'okay', label: 'Okay 😐', color: '#FCD34D', bg: '#FFFBEB' },
    { value: 'tough', label: 'Tough 😓', color: '#FDA4AF', bg: '#FFF1F2' },
] as const;

function getMood(value: string) {
    return MOODS.find(m => m.value === value) ?? MOODS[1];
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Report Card ────────────────────────────────────────────────────────────
function ReportCard({
    report, canEdit, onEdit, onDelete,
}: {
    report: DailyReport; canEdit: boolean;
    onEdit: (r: DailyReport) => void; onDelete: (id: string) => void;
}) {
    const mood = getMood(report.mood);
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-3xl shadow-xl shadow-indigo-50 p-5 group"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm"
                        style={{ backgroundColor: '#C084FC' }}>
                        {report.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-700 text-sm">{report.authorName}</p>
                        <p className="text-xs text-slate-400">{formatDate(report.date)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: mood.bg, color: mood.color }}>
                        {mood.label}
                    </span>
                    {canEdit && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                onClick={() => onEdit(report)}
                                className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-100">
                                <Pencil size={12} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                onClick={() => onDelete(report.id)}
                                className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100">
                                <Trash2 size={12} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks worked on */}
            {report.tasksWorkedOn && (
                <div className="mb-2.5 flex items-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 w-20 shrink-0">Tasks</span>
                    <p className="text-xs text-slate-500 font-medium">{report.tasksWorkedOn}</p>
                </div>
            )}

            {/* Content */}
            <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 w-20 shrink-0">Update</span>
                <p className="text-sm text-slate-600 leading-relaxed">{report.content}</p>
            </div>

            {/* Timestamp */}
            <p className="text-[10px] text-slate-300 mt-3 text-right">
                {report.updatedAt !== report.createdAt ? 'Edited · ' : ''}
                {new Date(report.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </motion.div>
    );
}

// ─── Report Modal ────────────────────────────────────────────────────────────
function ReportModal({
    open, initial, authorId, authorName, onClose,
}: {
    open: boolean; initial: DailyReport | null;
    authorId: string; authorName: string;
    onClose: () => void;
}) {
    const { addReport, editReport } = useReports();
    const today = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState(initial?.date ?? today);
    const [content, setContent] = useState(initial?.content ?? '');
    const [tasksWorkedOn, setTasksWorkedOn] = useState(initial?.tasksWorkedOn ?? '');
    const [mood, setMood] = useState<DailyReport['mood']>(initial?.mood ?? 'good');
    const [error, setError] = useState('');

    const reset = () => {
        setDate(today); setContent(''); setTasksWorkedOn(''); setMood('good'); setError('');
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = () => {
        if (!content.trim()) { setError('Please write your daily update.'); return; }
        const payload = { authorId, authorName, date, content: content.trim(), tasksWorkedOn: tasksWorkedOn.trim(), mood };
        if (initial) {
            editReport({ ...initial, ...payload });
        } else {
            addReport(payload);
        }
        handleClose();
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-slate-800">
                            {initial ? '✏️ Edit Report' : '📝 Daily Report'}
                        </h3>
                        <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Date */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                        </div>

                        {/* Tasks worked on */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tasks Worked On</label>
                            <input
                                type="text" value={tasksWorkedOn}
                                onChange={e => setTasksWorkedOn(e.target.value)}
                                placeholder="e.g. Homepage redesign, Auth flow..."
                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>

                        {/* Daily update */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Daily Update <span className="text-rose-400">*</span></label>
                            <textarea
                                value={content} onChange={e => { setContent(e.target.value); setError(''); }}
                                placeholder="What did you accomplish today? Any blockers? Plans for tomorrow?"
                                rows={4}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                            />
                            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
                        </div>

                        {/* Mood */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-2 block">How was your day?</label>
                            <div className="flex gap-2 flex-wrap">
                                {MOODS.map(m => (
                                    <button key={m.value} onClick={() => setMood(m.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${mood === m.value ? 'border-current shadow-sm scale-105' : 'border-transparent'}`}
                                        style={{ backgroundColor: mood === m.value ? m.bg : '#F8FAFC', color: m.color }}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={handleClose}
                            className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50">
                            Cancel
                        </button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-200">
                            {initial ? 'Save Changes' : 'Submit Report'}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main View ───────────────────────────────────────────────────────────────
export default function ReportsView() {
    const { getVisibleReports, deleteReport } = useReports();
    const { currentUser, initialized } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<DailyReport | null>(null);
    const [filterEmployee, setFilterEmployee] = useState('All');

    // Show skeleton while auth loads from localStorage
    if (!initialized || !currentUser) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-2xl w-48" />
                <div className="h-32 bg-slate-100 rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-slate-100 rounded-3xl" />
                    <div className="h-40 bg-slate-100 rounded-3xl" />
                </div>
            </div>
        );
    }

    const isBoss = currentUser.role === 'boss';
    const visibleReports = getVisibleReports(currentUser.id, currentUser.role);

    // For boss: group by employee, with optional filter
    const filteredReports = filterEmployee === 'All'
        ? visibleReports
        : visibleReports.filter(r => r.authorId === filterEmployee);

    // Unique employees who have posted reports (for boss filter)
    const employees = Array.from(new Map(visibleReports.map(r => [r.authorId, r.authorName])).entries());

    // Today's report by current user (for employee — to show "already submitted" state)
    const today = new Date().toISOString().split('T')[0];
    const todayReport = visibleReports.find(r => r.authorId === currentUser.id && r.date === today);

    const openNew = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (r: DailyReport) => { setEditing(r); setModalOpen(true); };

    // Sort: newest date first, then newest time
    const sorted = [...filteredReports].sort((a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-700">📝 Daily Reports</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {isBoss ? 'All employee daily updates' : 'Your personal daily updates — visible only to you and your boss'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Boss: employee filter */}
                    {isBoss && employees.length > 0 && (
                        <div className="relative">
                            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2 pr-8 text-sm font-medium text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer">
                                <option value="All">All Employees</option>
                                {employees.map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={openNew}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-200">
                        <Plus size={14} /> {todayReport && !isBoss ? 'Add Another' : 'New Report'}
                    </motion.button>
                </div>
            </div>

            {/* Today's status banner (employee only) */}
            {!isBoss && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl px-5 py-3.5 flex items-center gap-3 ${todayReport ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}
                >
                    <span className="text-xl">{todayReport ? '✅' : '⏰'}</span>
                    <div>
                        <p className={`text-sm font-semibold ${todayReport ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {todayReport ? "Today's report submitted!" : "You haven't submitted today's report yet"}
                        </p>
                        <p className={`text-xs ${todayReport ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {todayReport
                                ? `Submitted at ${new Date(todayReport.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                                : 'Click "New Report" to add your daily update'}
                        </p>
                    </div>
                    {todayReport && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => openEdit(todayReport)}
                            className="ml-auto px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-600 text-xs font-semibold hover:bg-emerald-200">
                            Edit
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* Reports list */}
            {sorted.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-50 p-12 flex flex-col items-center gap-3 text-center">
                    <FileText size={40} className="text-slate-200" />
                    <p className="text-slate-400 font-medium">No reports yet</p>
                    <p className="text-slate-300 text-sm">
                        {isBoss ? 'Employees haven\'t submitted any reports yet.' : 'Submit your first daily report to get started.'}
                    </p>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={openNew}
                        className="mt-2 px-5 py-2 rounded-2xl bg-purple-100 text-purple-600 text-sm font-semibold hover:bg-purple-200">
                        <Plus size={14} className="inline mr-1" /> Add Report
                    </motion.button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {sorted.map(r => (
                            <ReportCard
                                key={r.id}
                                report={r}
                                canEdit={r.authorId === currentUser.id}
                                onEdit={openEdit}
                                onDelete={deleteReport}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <ReportModal
                open={modalOpen}
                initial={editing}
                authorId={currentUser.id}
                authorName={currentUser.name}
                onClose={() => { setModalOpen(false); setEditing(null); }}
            />
        </motion.div>
    );
}
