'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Download, Upload, RotateCcw, ChevronDown } from 'lucide-react';
import { useProject, ViewTab } from '../context/ProjectContext';
import ConfirmDialog from './ConfirmDialog';

const VIEW_OPTIONS: { value: ViewTab; label: string }[] = [
    { value: 'dashboard', label: '📊 Dashboard' },
    { value: 'tasks', label: '📋 Task Tracker' },
    { value: 'matrix', label: '🎯 Eisenhower Matrix' },
    { value: 'kanban', label: '🗂️ Kanban Board' },
    { value: 'gantt', label: '📅 Gantt Chart' },
    { value: 'weekly', label: '📆 Weekly Schedule' },
    { value: 'calendar', label: '🗓️ Monthly Calendar' },
];

interface SettingsPanelProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
    const { settings, updateSettings, exportData, importData, resetData } = useProject();
    const [localName, setLocalName] = useState(settings.appName);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleNameSave = () => {
        if (localName.trim()) updateSettings({ appName: localName.trim() });
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const text = ev.target?.result as string;
            importData(text);
        };
        reader.readAsText(file);
        e.target.value = '';
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
                            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[85] shadow-2xl shadow-slate-300 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                                        <Settings size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800">Settings</h2>
                                        <p className="text-xs text-slate-400">Customize your workspace</p>
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

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                                {/* App Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">App Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={localName}
                                            onChange={e => setLocalName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                                            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all"
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={handleNameSave}
                                            className="px-4 py-2.5 rounded-2xl bg-purple-100 text-purple-600 text-sm font-semibold hover:bg-purple-200 transition-colors"
                                        >
                                            Save
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Default View */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default View</label>
                                    <div className="relative">
                                        <select
                                            value={settings.defaultView}
                                            onChange={e => updateSettings({ defaultView: e.target.value as ViewTab })}
                                            className="w-full appearance-none px-4 py-2.5 pr-8 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all cursor-pointer"
                                        >
                                            {VIEW_OPTIONS.map(v => (
                                                <option key={v.value} value={v.value}>{v.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1.5">This view opens when the app loads.</p>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100" />

                                {/* Data Management */}
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Management</p>
                                    <div className="space-y-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                                            onClick={exportData}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                        >
                                            <Download size={16} />
                                            Export Data as JSON
                                            <span className="ml-auto text-xs text-emerald-400">Backup</span>
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => fileRef.current?.click()}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 text-sm font-semibold border border-sky-100 hover:bg-sky-100 transition-colors"
                                        >
                                            <Upload size={16} />
                                            Import Data from JSON
                                            <span className="ml-auto text-xs text-sky-400">Restore</span>
                                        </motion.button>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={handleImport}
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100" />

                                {/* Danger Zone */}
                                <div>
                                    <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">Danger Zone</p>
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowResetConfirm(true)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-50 text-rose-600 text-sm font-semibold border border-rose-100 hover:bg-rose-100 transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                        Reset to Default Data
                                        <span className="ml-auto text-xs text-rose-400">Irreversible</span>
                                    </motion.button>
                                    <p className="text-xs text-slate-400 mt-1.5">Restores the original 15 demo tasks and 5 projects.</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={showResetConfirm}
                title="Reset All Data?"
                message="This will permanently delete all your tasks, projects, and settings, restoring the original demo data. This cannot be undone."
                confirmLabel="Reset Everything"
                onConfirm={() => { resetData(); setShowResetConfirm(false); onClose(); }}
                onCancel={() => setShowResetConfirm(false)}
            />
        </>
    );
}
