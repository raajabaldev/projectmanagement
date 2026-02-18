'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type ExpenseType = 'income' | 'expense';
export type ExpenseCategory =
    | 'Revenue' | 'Investment' | 'Other Income'
    | 'Salary' | 'Rent' | 'Marketing' | 'Equipment' | 'Utilities' | 'Travel' | 'Other Expense';

export interface Expense {
    id: string;
    date: string;
    description: string;
    category: ExpenseCategory;
    type: ExpenseType;
    amount: number;
    createdBy: string; // user id
}

const DEFAULT_EXPENSES: Expense[] = [
    { id: 'EX001', date: '2026-02-01', description: 'Client Project Revenue', category: 'Revenue', type: 'income', amount: 150000, createdBy: 'u1' },
    { id: 'EX002', date: '2026-02-01', description: 'Monthly Salaries', category: 'Salary', type: 'expense', amount: 80000, createdBy: 'u1' },
    { id: 'EX003', date: '2026-02-05', description: 'Office Rent', category: 'Rent', type: 'expense', amount: 25000, createdBy: 'u1' },
    { id: 'EX004', date: '2026-02-08', description: 'Social Media Ads', category: 'Marketing', type: 'expense', amount: 12000, createdBy: 'u1' },
    { id: 'EX005', date: '2026-02-10', description: 'New Laptops', category: 'Equipment', type: 'expense', amount: 45000, createdBy: 'u1' },
    { id: 'EX006', date: '2026-02-12', description: 'Consulting Revenue', category: 'Revenue', type: 'income', amount: 60000, createdBy: 'u1' },
    { id: 'EX007', date: '2026-02-14', description: 'Internet & Utilities', category: 'Utilities', type: 'expense', amount: 5000, createdBy: 'u1' },
    { id: 'EX008', date: '2026-02-15', description: 'Client Retainer', category: 'Revenue', type: 'income', amount: 40000, createdBy: 'u1' },
    { id: 'EX009', date: '2026-02-16', description: 'Team Travel', category: 'Travel', type: 'expense', amount: 8000, createdBy: 'u1' },
    { id: 'EX010', date: '2026-02-18', description: 'Software Licenses', category: 'Equipment', type: 'expense', amount: 6500, createdBy: 'u1' },
];

interface ExpenseState {
    expenses: Expense[];
}

type ExpenseAction =
    | { type: 'ADD'; expense: Expense }
    | { type: 'EDIT'; expense: Expense }
    | { type: 'DELETE'; id: string }
    | { type: 'IMPORT'; expenses: Expense[] };

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
    switch (action.type) {
        case 'ADD': return { expenses: [action.expense, ...state.expenses] };
        case 'EDIT': return { expenses: state.expenses.map(e => e.id === action.expense.id ? action.expense : e) };
        case 'DELETE': return { expenses: state.expenses.filter(e => e.id !== action.id) };
        case 'IMPORT': return { expenses: action.expenses };
        default: return state;
    }
}

const EXPENSE_KEY = 'pm_expenses_v1';

function loadExpenses(): ExpenseState {
    if (typeof window === 'undefined') return { expenses: DEFAULT_EXPENSES };
    try {
        const raw = localStorage.getItem(EXPENSE_KEY);
        if (raw) return JSON.parse(raw) as ExpenseState;
    } catch { /* ignore */ }
    return { expenses: DEFAULT_EXPENSES };
}

function genExpenseId(): string {
    return `EX${Date.now().toString(36).toUpperCase()}`;
}

interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (e: Omit<Expense, 'id'>) => void;
    editExpense: (e: Expense) => void;
    deleteExpense: (id: string) => void;
    // Computed summaries
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(expenseReducer, undefined, loadExpenses);

    useEffect(() => {
        try { localStorage.setItem(EXPENSE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    }, [state]);

    const addExpense = (e: Omit<Expense, 'id'>) =>
        dispatch({ type: 'ADD', expense: { ...e, id: genExpenseId() } });

    const editExpense = (e: Expense) => dispatch({ type: 'EDIT', expense: e });
    const deleteExpense = (id: string) => dispatch({ type: 'DELETE', id });

    const totalIncome = state.expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpenses = state.expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    return (
        <ExpenseContext.Provider value={{
            expenses: state.expenses,
            addExpense, editExpense, deleteExpense,
            totalIncome, totalExpenses, netProfit, profitMargin,
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpense() {
    const ctx = useContext(ExpenseContext);
    if (!ctx) throw new Error('useExpense must be used within ExpenseProvider');
    return ctx;
}
