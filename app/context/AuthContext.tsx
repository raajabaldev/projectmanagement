'use client';

import React, { createContext, useContext, useReducer, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'boss' | 'employee';

export interface User {
    id: string;
    name: string;
    employeeId: string; // login ID e.g. EMP001
    password: string;
    role: UserRole;
    department?: string;
}

const DEFAULT_USERS: User[] = [
    { id: 'u1', name: 'Admin Boss', employeeId: 'BOSS01', password: 'boss123', role: 'boss', department: 'Management' },
    { id: 'u2', name: 'Alice Kumar', employeeId: 'EMP001', password: 'emp123', role: 'employee', department: 'Design' },
    { id: 'u3', name: 'Bob Sharma', employeeId: 'EMP002', password: 'emp123', role: 'employee', department: 'Development' },
    { id: 'u4', name: 'Carol Singh', employeeId: 'EMP003', password: 'emp123', role: 'employee', department: 'Marketing' },
];

interface AuthState {
    users: User[];
    currentUser: User | null;
}

type AuthAction =
    | { type: 'LOGIN'; user: User }
    | { type: 'LOGOUT' }
    | { type: 'ADD_USER'; user: User }
    | { type: 'EDIT_USER'; user: User }
    | { type: 'DELETE_USER'; id: string }
    | { type: 'LOAD'; state: AuthState };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, currentUser: action.user };
        case 'LOGOUT':
            return { ...state, currentUser: null };
        case 'ADD_USER':
            return { ...state, users: [...state.users, action.user] };
        case 'EDIT_USER':
            return { ...state, users: state.users.map(u => u.id === action.user.id ? action.user : u) };
        case 'DELETE_USER':
            return { ...state, users: state.users.filter(u => u.id !== action.id) };
        case 'LOAD':
            return action.state;
        default:
            return state;
    }
}

const USERS_KEY = 'pm_users_v1';
const SESSION_KEY = 'pm_session_v1';

function loadAuthState(): AuthState {
    if (typeof window === 'undefined') return { users: DEFAULT_USERS, currentUser: null };
    try {
        const usersRaw = localStorage.getItem(USERS_KEY);
        const users: User[] = usersRaw ? JSON.parse(usersRaw) : DEFAULT_USERS;
        const sessionRaw = localStorage.getItem(SESSION_KEY);
        const sessionId: string | null = sessionRaw ? JSON.parse(sessionRaw) : null;
        const currentUser = sessionId ? users.find(u => u.id === sessionId) ?? null : null;
        return { users, currentUser };
    } catch {
        return { users: DEFAULT_USERS, currentUser: null };
    }
}

function generateUserId(): string {
    return `u${Date.now().toString(36)}`;
}

interface AuthContextType {
    users: User[];
    currentUser: User | null;
    isBoss: boolean;
    initialized: boolean; // true once localStorage has been read on the client
    login: (employeeId: string, password: string) => boolean;
    logout: () => void;
    addUser: (user: Omit<User, 'id'>) => void;
    editUser: (user: User) => void;
    deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, { users: DEFAULT_USERS, currentUser: null });
    const [initialized, setInitialized] = useState(false);

    // Load from localStorage on first client mount
    useEffect(() => {
        const loaded = loadAuthState();
        dispatch({ type: 'LOAD', state: loaded });
        setInitialized(true);
    }, []);

    // Persist users list
    useEffect(() => {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
        } catch { /* ignore */ }
    }, [state.users]);

    // Persist session
    useEffect(() => {
        try {
            if (state.currentUser) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser.id));
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        } catch { /* ignore */ }
    }, [state.currentUser]);

    const login = (employeeId: string, password: string): boolean => {
        const user = state.users.find(
            u => u.employeeId.toLowerCase() === employeeId.toLowerCase() && u.password === password
        );
        if (user) {
            dispatch({ type: 'LOGIN', user });
            return true;
        }
        return false;
    };

    const logout = () => dispatch({ type: 'LOGOUT' });

    const addUser = (user: Omit<User, 'id'>) =>
        dispatch({ type: 'ADD_USER', user: { ...user, id: generateUserId() } });

    const editUser = (user: User) => {
        dispatch({ type: 'EDIT_USER', user });
        // If editing current user, update session too
        if (state.currentUser?.id === user.id) {
            dispatch({ type: 'LOGIN', user });
        }
    };

    const deleteUser = (id: string) => dispatch({ type: 'DELETE_USER', id });

    return (
        <AuthContext.Provider value={{
            users: state.users,
            currentUser: state.currentUser,
            isBoss: state.currentUser?.role === 'boss',
            initialized,
            login, logout, addUser, editUser, deleteUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
