'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Check, Users, Shield, User } from 'lucide-react';
import { useAuth, User as UserType, UserRole } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import ConfirmDialog from './ConfirmDialog';

interface UserManagerProps {
    open: boolean;
    onClose: () => void;
}

const DEPARTMENTS = ['Management', 'Design', 'Development', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'];

const emptyForm = () => ({
    name: '',
    employeeId: '',
    password: '',
    role: 'employee' as UserRole,
    department: 'Development',
});

export default function UserManager({ open, onClose }: UserManagerProps) {
    const { users, currentUser, addUser, editUser, deleteUser } = useAuth();
    const { tasks } = useProject();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState(emptyForm());
    const [newForm, setNewForm] = useState(emptyForm());
    const [showAdd, setShowAdd] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<UserType | null>(null);
    const [idError, setIdError] = useState('');

    const startEdit = (u: UserType) => {
        setEditingId(u.id);
        setEditForm({ name: u.name, employeeId: u.employeeId, password: u.password, role: u.role, department: u.department ?? 'Development' });
    };

    const saveEdit = () => {
        if (!editingId || !editForm.name.trim() || !editForm.employeeId.trim()) return;
        const existing = users.find(u => u.id === editingId);
        if (!existing) return;
        editUser({ ...existing, ...editForm, name: editForm.name.trim(), employeeId: editForm.employeeId.trim() });
        setEditingId(null);
    };

    const handleAdd = () => {
        if (!newForm.name.trim() || !newForm.employeeId.trim() || !newForm.password.trim()) return;
        const duplicate = users.find(u => u.employeeId.toLowerCase() === newForm.employeeId.toLowerCase());
        if (duplicate) { setIdError('Employee ID already exists.'); return; }
        addUser({ ...newForm, name: newForm.name.trim(), employeeId: newForm.employeeId.trim().toUpperCase() });
        setNewForm(emptyForm());
        setShowAdd(false);
        setIdError('');
    };

    const getTaskCount = (u: UserType) => tasks.filter(t => t.ownerId === u.id).length;

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[80]"
                            style={{ backgroundColor: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[85] shadow-2xl shadow-slate-300 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                        <Users size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800">Manage Employees</h2>
                                        <p className="text-xs text-slate-400">{users.length} users registered</p>
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <X size={18} />
                                </motion.button>
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                                {users.map(u => {
                                    const taskCount = getTaskCount(u);
                                    const isEditing = editingId === u.id;
                                    const isSelf = currentUser?.id === u.id;
                                    return (
                                        <motion.div key={u.id} layout className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            {isEditing ? (
                                                <div className="space-y-2.5">
                                                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                        placeholder="Full name" autoFocus
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200" />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input value={editForm.employeeId} onChange={e => setEditForm(f => ({ ...f, employeeId: e.target.value }))}
                                                            placeholder="Employee ID"
                                                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200" />
                                                        <input value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                                                            placeholder="Password"
                                                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}
                                                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                                                            <option value="employee">Employee</option>
                                                            <option value="boss">Boss</option>
                                                        </select>
                                                        <select value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                                                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
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
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${u.role === 'boss' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-purple-400 to-indigo-500'}`}>
                                                        {u.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-semibold text-slate-700 text-sm truncate">{u.name}</p>
                                                            {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">You</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs font-mono text-slate-400">{u.employeeId}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${u.role === 'boss' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                                                                {u.role === 'boss' ? '👑 Boss' : '👤 Employee'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">{taskCount} tasks</span>
                                                        </div>
                                                        {u.department && <p className="text-[10px] text-slate-400 mt-0.5">{u.department}</p>}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => startEdit(u)}
                                                            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-500 hover:border-purple-200 transition-colors">
                                                            <Pencil size={13} />
                                                        </motion.button>
                                                        {!isSelf && (
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                onClick={() => setConfirmDelete(u)}
                                                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors">
                                                                <Trash2 size={13} />
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Add Employee */}
                            <div className="px-6 py-5 border-t border-slate-100 bg-white">
                                <AnimatePresence>
                                    {showAdd ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Add New Employee</p>
                                            <input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="Full name" autoFocus
                                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <input value={newForm.employeeId} onChange={e => { setNewForm(f => ({ ...f, employeeId: e.target.value })); setIdError(''); }}
                                                        placeholder="Employee ID (e.g. EMP005)"
                                                        className={`w-full px-3 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all ${idError ? 'border-rose-300' : 'border-slate-200'}`} />
                                                    {idError && <p className="text-[10px] text-rose-500 mt-1">{idError}</p>}
                                                </div>
                                                <input value={newForm.password} onChange={e => setNewForm(f => ({ ...f, password: e.target.value }))}
                                                    placeholder="Password"
                                                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select value={newForm.role} onChange={e => setNewForm(f => ({ ...f, role: e.target.value as UserRole }))}
                                                    className="px-3 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200">
                                                    <option value="employee">Employee</option>
                                                    <option value="boss">Boss</option>
                                                </select>
                                                <select value={newForm.department} onChange={e => setNewForm(f => ({ ...f, department: e.target.value }))}
                                                    className="px-3 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200">
                                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd}
                                                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                                                    <Plus size={14} /> Add Employee
                                                </motion.button>
                                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setShowAdd(false); setIdError(''); }}
                                                    className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-sm font-semibold">
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowAdd(true)}
                                            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md shadow-purple-200 flex items-center justify-center gap-2">
                                            <Plus size={16} /> Add Employee
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={!!confirmDelete}
                title="Remove Employee?"
                message={`"${confirmDelete?.name}" (${confirmDelete?.employeeId}) will be removed. Their tasks will remain but become unassigned.`}
                confirmLabel="Remove"
                onConfirm={() => { if (confirmDelete) deleteUser(confirmDelete.id); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
        </>
    );
}
