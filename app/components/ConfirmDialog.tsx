'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

export default function ConfirmDialog({
    open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl shadow-slate-200 p-6 max-w-sm w-full"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-rose-50' : 'bg-amber-50'}`}>
                                <AlertTriangle size={20} className={danger ? 'text-rose-500' : 'text-amber-500'} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">{title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{message}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onCancel}
                                className="px-5 py-2 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onConfirm}
                                className={`px-5 py-2 rounded-2xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                            >
                                {confirmLabel}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
