"use client";

import { useAuth } from '../app/context/AuthContext';
import Link from 'next/link';

export default function HeaderAuth() {
    const { user, loading, logout } = useAuth();

    if (loading) return <div className="w-20 h-8 bg-gray-100 animate-pulse rounded"></div>;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-carbon">{user.email.split('@')[0]}</span>
                    {user.isSubscribed ? (
                        <span className="text-xs text-success font-bold tracking-wide uppercase">Pro Active</span>
                    ) : (
                        <Link href="/pricing" className="text-xs text-warning hover:underline font-bold tracking-wide uppercase">Upgrade to Pro</Link>
                    )}
                </div>
                <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-carbon transition-colors">
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-carbon transition-colors">
                Log in
            </Link>
            <Link href="/pricing" className="bg-carbon text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-black transition-all">
                Get Started
            </Link>
        </div>
    );
}
