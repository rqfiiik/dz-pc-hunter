import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
    title: 'DZ PC Hunter',
    description: 'Algerian PC Deal Intelligence Platform',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans`}>{children}</body>
        </html>
    )
}
