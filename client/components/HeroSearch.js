"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function HeroSearch({ onSearch, isLoading }) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl relative"
        >
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-16 pr-32 py-5 bg-white border-2 border-transparent focus:border-primary/20 text-gray-900 placeholder:text-slate-400 rounded-full text-lg font-medium shadow-hero focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all"
                    placeholder="Paste link or type model (e.g. MacBook M1)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                />
                <div className="absolute inset-y-2 right-2">
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="h-full px-8 rounded-full bg-primary hover:bg-primary-600 text-white font-bold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/30"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Scanning
                            </span>
                        ) : (
                            "Scan Market"
                        )}
                    </button>
                </div>
            </div>
        </motion.form>
    );
}
