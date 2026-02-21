"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export function HeroSearch({ onSearch, isLoading }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Fetch autocomplete suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Silent return if not logged in

                const response = await axios.get(`http://localhost:5000/api/autocomplete?q=${encodeURIComponent(query)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuggestions(response.data);
            } catch (error) {
                console.error("Autocomplete error:", error);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        onSearch(suggestion);
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl relative"
            ref={wrapperRef}
        >
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-16 pr-32 py-5 bg-white border-2 border-transparent focus:border-primary/20 text-gray-900 placeholder:text-slate-400 rounded-full text-lg font-medium shadow-hero focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all relative z-10"
                    placeholder="Paste link or type model (e.g. MacBook M1)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    disabled={isLoading}
                />

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden z-0 pt-2 border border-slate-100"
                        >
                            <ul>
                                {suggestions.map((suggestion, idx) => (
                                    <li key={idx}>
                                        <button
                                            type="button"
                                            className="w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors text-slate-700 font-medium flex items-center gap-3"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <Search size={16} className="text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{suggestion}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute inset-y-2 right-2 z-10">
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
