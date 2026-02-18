'use client';

import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, ListChecks, TrendingUp, Target, CalendarCheck } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

function CircularProgress({ value, label, color, icon }: { value: number; label: string; color: string; icon: React.ReactNode }) {
    const data = [{ name: label, value, fill: color }];
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-3xl shadow-xl shadow-indigo-100 p-6 flex flex-col items-center gap-3 flex-1 min-w-[180px]"
        >
            <div className="relative w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius="65%" outerRadius="90%"
                        startAngle={90} endAngle={-270}
                        data={[{ value: 100, fill: '#f1f5f9' }, ...data]}
                    >
                        <RadialBar dataKey="value" cornerRadius={10} background={false} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">{value}%</span>
                    <span style={{ color }} className="mt-0.5">{icon}</span>
                </div>
            </div>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
        </motion.div>
    );
}

function StatCard({ label, value, color, bg, icon }: { label: string; value: number; color: string; bg: string; icon: React.ReactNode }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-3xl shadow-xl shadow-indigo-100 p-6 flex items-center gap-4 flex-1 min-w-[160px]"
        >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const { tasks, projects } = useProject();

    // Compute stats directly from tasks so they always reflect live state
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const pending = tasks.filter(t => t.status === 'To Do').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;

    // Total Progress: map each task's status to a progress value and average
    const statusProgressMap: Record<string, number> = {
        'To Do': 0, 'In Progress': 50, 'Review': 80, 'Done': 100,
    };
    const overallProgress = total > 0
        ? Math.round(tasks.reduce((acc, t) => acc + (statusProgressMap[t.status] ?? t.progress), 0) / total)
        : 0;

    // Completion Rate: % of tasks with status Done
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // On-Time Rate: tasks not yet overdue (due date >= today) OR already done
    const today = new Date().toISOString().split('T')[0];
    const onTime = tasks.filter(t => t.status === 'Done' || t.dueDate >= today).length;
    const onTimeRate = total > 0 ? Math.round((onTime / total) * 100) : 0;

    const projectStats = projects.map(p => ({
        ...p,
        count: tasks.filter(t => t.project === p.name).length,
        done: tasks.filter(t => t.project === p.name && t.status === 'Done').length,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Circular Charts */}
            <div>
                <h2 className="text-lg font-bold text-slate-700 mb-4">📊 Progress Overview</h2>
                <div className="flex gap-4 flex-wrap">
                    <CircularProgress value={overallProgress} label="Total Progress" color="#C084FC" icon={<TrendingUp size={16} />} />
                    <CircularProgress value={completionRate} label="Completion Rate" color="#6EE7B7" icon={<Target size={16} />} />
                    <CircularProgress value={onTimeRate} label="On-Time Rate" color="#7DD3FC" icon={<CalendarCheck size={16} />} />
                </div>
            </div>

            {/* Summary Cards */}
            <div>
                <h2 className="text-lg font-bold text-slate-700 mb-4">📋 Task Summary</h2>
                <div className="flex gap-4 flex-wrap">
                    <StatCard label="Total Tasks" value={total} color="#C084FC" bg="#F3E8FF" icon={<ListChecks size={22} />} />
                    <StatCard label="Pending" value={pending} color="#FDA4AF" bg="#FFF1F2" icon={<Clock size={22} />} />
                    <StatCard label="In Progress" value={inProgress} color="#7DD3FC" bg="#F0F9FF" icon={<TrendingUp size={22} />} />
                    <StatCard label="Completed" value={completed} color="#6EE7B7" bg="#ECFDF5" icon={<CheckCircle2 size={22} />} />
                </div>
            </div>

            {/* Project Breakdown */}
            <div>
                <h2 className="text-lg font-bold text-slate-700 mb-4">🗂️ Projects at a Glance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectStats.map(p => {
                        const pct = p.count > 0 ? Math.round((p.done / p.count) * 100) : 0;
                        return (
                            <motion.div
                                key={p.id}
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="bg-white rounded-3xl shadow-xl shadow-indigo-100 p-5"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span className="font-semibold text-slate-700 text-sm">{p.name}</span>
                                    <span className="ml-auto text-xs text-slate-400">{p.done}/{p.count} done</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-2.5 rounded-full"
                                        style={{ backgroundColor: p.color }}
                                    />
                                </div>
                                <p className="text-right text-xs font-semibold mt-1.5" style={{ color: p.color }}>{pct}%</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
