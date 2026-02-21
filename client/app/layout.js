import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link';
import { Database, LineChart } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import HeaderAuth from '../components/HeaderAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
    title: 'Algerian Flip Market Intelligence',
    description: 'Algerian PC Deal Intelligence Platform',
}

export default function RootLayout({ children }) {
    // In production, this should be moved to .env.local
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1014902102143-vq0q9q9q9q9q9q9q9q9q9q9q9q9q9.apps.googleusercontent.com';

    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans bg-gray-50 flex flex-col min-h-screen`}>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <AuthProvider>
                        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm relative z-50">
                            <Link href="/" className="font-extrabold text-xl text-carbon tracking-tight flex items-center gap-2">
                                FlipMarket <span className="text-primary">Intelligence</span>
                            </Link>
                            <div className="flex items-center gap-6">
                                <div className="flex gap-4">
                                    <Link href="/analytics" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                                        <LineChart size={16} /> Analytics
                                    </Link>
                                    <Link href="/worker" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                                        <Database size={16} /> Worker Dashboard
                                    </Link>
                                    <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                                        Admin QC
                                    </Link>
                                </div>
                                <div className="w-px h-6 bg-gray-200"></div>
                                <HeaderAuth />
                            </div>
                        </nav>
                        <div className="flex-1">
                            {children}
                        </div>
                    </AuthProvider>
                </GoogleOAuthProvider>
            </body>
        </html>
    )
}
