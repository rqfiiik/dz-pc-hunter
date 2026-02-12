/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5', // Electric Indigo
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                background: '#FAFAFA', // Porcelain
                surface: '#FFFFFF', // White
                carbon: '#111827', // Text Main
                slate: '#6B7280', // Text Muted
                mist: '#E5E7EB', // Border
                success: {
                    DEFAULT: '#10B981', // Emerald
                    bg: '#D1FAE5',
                    text: '#047857',
                },
                warning: {
                    DEFAULT: '#F59E0B', // Amber
                    bg: '#FEF3C7',
                    text: '#B45309',
                },
                error: {
                    DEFAULT: '#EF4444', // Rose
                    bg: '#FEE2E2',
                    text: '#B91C1C',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
                'hero': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
