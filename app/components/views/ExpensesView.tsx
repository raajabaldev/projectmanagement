'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Percent, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useExpense, Expense, ExpenseType, ExpenseCategory } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../ConfirmDialog';

const INCOME_CATEGORIES: ExpenseCategory[] = ['Revenue', 'Investment', 'Other Income'];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Salary', 'Rent', 'Marketing', 'Equipment', 'Utilities', 'Travel', 'Other Expense'];

const PIE_COLORS = ['#C084FC', '#6EE7B7', '#FDA4AF', '#7DD3FC', '#FCD34D', '#F9A8D4', '#86EFAC', '#67E8F9'];

function formatINR(n: number) {
    return '₹' + Math.abs(n).toLocaleString('en-IN');
}

function SummaryCard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub?: string }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-100 border border-slate-50"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mb-0.5">{value}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </motion.div>
    );
}

const emptyForm = (): Omit<Expense, 'id' | 'createdBy'> => ({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Revenue',
    type: 'income',
    amount: 0,
});

function ExpenseModal({ open, expense, onClose }: { open: boolean; expense?: Expense | null; onClose: () => void }) {
    const { addExpense, editExpense } = useExpense();
    const { currentUser } = useAuth();
    const [form, setForm] = useState<Omit<Expense, 'id' | 'createdBy'>>(emptyForm());
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEdit = !!expense;

    useState(() => {
        if (expense) {
            const { id: _id, createdBy: _cb, ...rest } = expense;
            setForm(rest);
        } else {
            setForm(emptyForm());
        }
        setErrors({});
    });

    const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.description.trim()) e.description = 'Description is required';
        if (!form.amount || form.amount <= 0) e.amount = 'Enter a valid amount';
        if (!form.date) e.date = 'Date is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        if (isEdit && expense) {
            editExpense({ ...form, id: expense.id, createdBy: expense.createdBy });
        } else {
            addExpense({ ...form, createdBy: currentUser?.id ?? 'u1' });
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                        className="bg-white rounded-3xl shadow-2xl shadow-slate-300 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">{isEdit ? '✏️ Edit Entry' : '➕ New Entry'}</h2>
                            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                <X size={18} />
                            </motion.button>
                        </div>

                        <div className="px-7 py-5 space-y-4">
                            {/* Type toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                <div className="flex gap-2">
                                    {(['income', 'expense'] as ExpenseType[]).map(t => (
                                        <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? 'Revenue' : 'Salary' }))}
                                            className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all ${form.type === t
                                                ? t === 'income' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                                : 'bg-slate-100 text-slate-500'}`}>
                                            {t === 'income' ? '💰 Income' : '📤 Expense'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description *</label>
                                <input type="text" value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="e.g. Client payment, Office rent…"
                                    className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all ${errors.description ? 'border-rose-300' : 'border-slate-200'}`} />
                                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                            </div>

                            {/* Amount + Category */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
                                    <input type="number" value={form.amount || ''}
                                        onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0"
                                        className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all ${errors.amount ? 'border-rose-300' : 'border-slate-200'}`} />
                                    {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                                    <select value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
                                <input type="date" value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all ${errors.date ? 'border-rose-300' : 'border-slate-200'}`} />
                            </div>
                        </div>

                        <div className="flex gap-3 px-7 py-5 border-t border-slate-100">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Cancel
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
                                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                                <Save size={15} /> {isEdit ? 'Save Changes' : 'Add Entry'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function ExpensesView() {
    const { expenses, deleteExpense, totalIncome, totalExpenses, netProfit, profitMargin } = useExpense();
    const { isBoss, currentUser } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    // Boss sees all, employee sees own
    const visibleExpenses = isBoss ? expenses : expenses.filter(e => e.createdBy === currentUser?.id);
    const filtered = filter === 'all' ? visibleExpenses : visibleExpenses.filter(e => e.type === filter);

    // Monthly chart data
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {};
    visibleExpenses.forEach(e => {
        const key = e.date.slice(0, 7);
        const label = new Date(e.date + '-01').toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!monthlyMap[key]) monthlyMap[key] = { month: label, income: 0, expense: 0 };
        if (e.type === 'income') monthlyMap[key].income += e.amount;
        else monthlyMap[key].expense += e.amount;
    });
    const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // Category breakdown (expenses only)
    const catMap: Record<string, number> = {};
    visibleExpenses.filter(e => e.type === 'expense').forEach(e => {
        catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
    });
    const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    const openNew = () => { setEditingExpense(null); setModalOpen(true); };
    const openEdit = (e: Expense) => { setEditingExpense(e); setModalOpen(true); };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-lg font-bold text-slate-700">💳 Expenses & Finance</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={openNew}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md shadow-purple-200">
                        <Plus size={14} /> Add Entry
                    </motion.button>
                </div>

                {/* Summary Cards */}
                {isBoss && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard label="Total Income" value={formatINR(totalIncome)} icon={<TrendingUp size={20} className="text-emerald-600" />} color="bg-emerald-50" />
                        <SummaryCard label="Total Expenses" value={formatINR(totalExpenses)} icon={<TrendingDown size={20} className="text-rose-500" />} color="bg-rose-50" />
                        <SummaryCard
                            label="Net Profit"
                            value={formatINR(netProfit)}
                            icon={<DollarSign size={20} className={netProfit >= 0 ? 'text-purple-600' : 'text-rose-600'} />}
                            color={netProfit >= 0 ? 'bg-purple-50' : 'bg-rose-50'}
                            sub={netProfit >= 0 ? '✅ Profitable' : '⚠️ Loss'}
                        />
                        <SummaryCard label="Profit Margin" value={`${profitMargin}%`} icon={<Percent size={20} className="text-sky-600" />} color="bg-sky-50" />
                    </div>
                )}

                {/* Charts (boss only) */}
                {isBoss && monthlyData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-xl shadow-slate-100">
                            <h3 className="font-bold text-slate-700 mb-4 text-sm">Monthly Income vs Expenses</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlyData} barGap={4}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: number | undefined) => formatINR(v ?? 0)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="income" name="Income" fill="#6EE7B7" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="expense" name="Expenses" fill="#FDA4AF" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {pieData.length > 0 && (
                            <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-100">
                                <h3 className="font-bold text-slate-700 mb-4 text-sm">Expense Breakdown</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v: number | undefined) => formatINR(v ?? 0)} contentStyle={{ borderRadius: 12, border: 'none' }} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                {/* Filter + Table */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-700 text-sm">Transactions ({filtered.length})</h3>
                        <div className="flex gap-1.5">
                            {(['all', 'income', 'expense'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-purple-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    {f === 'all' ? 'All' : f === 'income' ? '💰 Income' : '📤 Expense'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Date</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Description</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Category</th>
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Type</th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Amount</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-12 text-slate-300 text-sm">
                                        No entries yet. <button onClick={openNew} className="text-purple-400 underline">Add one?</button>
                                    </td></tr>
                                )}
                                {filtered.map((e, i) => (
                                    <motion.tr key={e.id}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        whileHover={{ backgroundColor: '#fafafa' }}
                                        className="border-b border-slate-50 last:border-0 transition-colors group">
                                        <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="px-5 py-3.5 text-sm font-medium text-slate-700 max-w-[200px] truncate">{e.description}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{e.category}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${e.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                                {e.type === 'income' ? '↑ Income' : '↓ Expense'}
                                            </span>
                                        </td>
                                        <td className={`px-5 py-3.5 text-right text-sm font-bold ${e.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {e.type === 'income' ? '+' : '-'}{formatINR(e.amount)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => openEdit(e)}
                                                    className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-100">
                                                    <Pencil size={12} />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => setDeleteTarget(e)}
                                                    className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100">
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
            </motion.div>

            <ExpenseModal open={modalOpen} expense={editingExpense} onClose={() => { setModalOpen(false); setEditingExpense(null); }} />
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Entry?"
                message={`"${deleteTarget?.description}" (${formatINR(deleteTarget?.amount ?? 0)}) will be permanently deleted.`}
                onConfirm={() => { if (deleteTarget) deleteExpense(deleteTarget.id); setDeleteTarget(null); }}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}
