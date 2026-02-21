import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link';
import { Database } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
    title: 'Algerian Flip Market Intelligence',
    description: 'Algerian PC Deal Intelligence Platform',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans bg-gray-50 flex flex-col min-h-screen`}>
                <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm relative z-50">
                    <Link href="/" className="font-extrabold text-xl text-carbon tracking-tight flex items-center gap-2">
                        FlipMarket <span className="text-primary">Intelligence</span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/worker" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                            <Database size={16} /> Worker Dashboard
                        </Link>
                        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                            Admin QC
                        </Link>
                    </div>
                </nav>
                <div className="flex-1">
                    {children}
                </div>
            </body>
        </html>
    )
}
