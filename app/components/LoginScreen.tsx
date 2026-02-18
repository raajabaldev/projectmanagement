'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ appName }: { appName: string }) {
    const { login } = useAuth();
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!employeeId.trim() || !password.trim()) {
            setError('Please enter your Employee ID and password.');
            return;
        }
        setLoading(true);
        setError('');
        // Small delay for UX feel
        await new Promise(r => setTimeout(r, 600));
        const ok = login(employeeId.trim(), password);
        if (!ok) {
            setError('Invalid Employee ID or password. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-900/50"
                    >
                        <span className="text-white font-black text-4xl">P</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-black text-white mb-1"
                    >
                        {appName}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-purple-300 text-sm"
                    >
                        Sign in to your workspace
                    </motion.p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                    <div className="space-y-4">
                        {/* Employee ID */}
                        <div>
                            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                                Employee ID
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={e => { setEmployeeId(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    placeholder="e.g. EMP001 or BOSS01"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/15 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-12 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/15 transition-all"
                                />
                                <button
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-900/70 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Sign In
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <p className="text-xs text-purple-300/70 text-center mb-3">Demo credentials</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Boss', id: 'BOSS01', pw: 'boss123' },
                                { label: 'Employee', id: 'EMP001', pw: 'emp123' },
                            ].map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { setEmployeeId(c.id); setPassword(c.pw); setError(''); }}
                                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
                                >
                                    <p className="text-xs font-semibold text-purple-200">{c.label}</p>
                                    <p className="text-[10px] text-purple-400 font-mono">{c.id}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
