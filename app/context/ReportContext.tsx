'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DailyReport {
    id: string;
    authorId: string;
    authorName: string;
    date: string; // YYYY-MM-DD
    content: string;
    tasksWorkedOn: string;
    mood: 'great' | 'good' | 'okay' | 'tough';
    createdAt: string; // ISO timestamp
    updatedAt: string;
}

interface ReportContextType {
    reports: DailyReport[];
    addReport: (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
    editReport: (report: DailyReport) => void;
    deleteReport: (id: string) => void;
    // Returns reports visible to the current user (own reports + boss sees all)
    getVisibleReports: (userId: string, role: 'boss' | 'employee') => DailyReport[];
}

const ReportContext = createContext<ReportContextType | null>(null);

const STORAGE_KEY = 'pm_daily_reports_v1';

function generateId(): string {
    return `RPT${Date.now().toString(36).toUpperCase()}`;
}

const SAMPLE_REPORTS: DailyReport[] = [
    {
        id: 'RPT001', authorId: 'u2', authorName: 'Alice Kumar',
        date: new Date().toISOString().split('T')[0],
        content: 'Completed the wireframes for the new homepage layout. Had a sync with the design team to align on brand guidelines. Will start high-fidelity mockups tomorrow.',
        tasksWorkedOn: 'Design new homepage layout',
        mood: 'great',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
        id: 'RPT002', authorId: 'u3', authorName: 'Bob Sharma',
        date: new Date().toISOString().split('T')[0],
        content: 'Implemented OAuth2 login flow. Ran into an issue with token refresh — debugging in progress. Should be resolved by EOD tomorrow.',
        tasksWorkedOn: 'Implement auth flow',
        mood: 'okay',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
];

export function ReportProvider({ children }: { children: ReactNode }) {
    const [reports, setReports] = useState<DailyReport[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setReports(JSON.parse(raw) as DailyReport[]);
            } else {
                setReports(SAMPLE_REPORTS);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_REPORTS));
            }
        } catch {
            setReports(SAMPLE_REPORTS);
        }
    }, []);

    // Persist on every change
    useEffect(() => {
        if (reports.length > 0) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)); } catch { /* ignore */ }
        }
    }, [reports]);

    const addReport = (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newReport: DailyReport = { ...report, id: generateId(), createdAt: now, updatedAt: now };
        setReports(prev => [newReport, ...prev]);
    };

    const editReport = (updated: DailyReport) => {
        setReports(prev => prev.map(r => r.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : r));
    };

    const deleteReport = (id: string) => {
        setReports(prev => prev.filter(r => r.id !== id));
    };

    const getVisibleReports = (userId: string, role: 'boss' | 'employee') => {
        if (role === 'boss') return reports; // boss sees all
        return reports.filter(r => r.authorId === userId); // employee sees own only
    };

    return (
        <ReportContext.Provider value={{ reports, addReport, editReport, deleteReport, getVisibleReports }}>
            {children}
        </ReportContext.Provider>
    );
}

export function useReports() {
    const ctx = useContext(ReportContext);
    if (!ctx) throw new Error('useReports must be used within ReportProvider');
    return ctx;
}
