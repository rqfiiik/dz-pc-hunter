"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Filter, ArrowUpDown } from 'lucide-react';
import { HeroSearch } from '../components/HeroSearch';
import { StatsTicker } from '../components/StatsTicker';
import { DealCard } from '../components/DealCard';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('score'); // 'score' | 'price_asc' | 'price_desc'

    const handleScan = async (model) => {
        setLoading(true);
        setError(null);
        setData(null);

        // Artificial delay for UX (to show loading state if backend is too fast)
        // await new Promise(r => setTimeout(r, 800)); 

        try {
            const response = await axios.post('http://localhost:5000/scan', { model });
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch deals. The scraper might be blocked or the server is down.');
        } finally {
            setLoading(false);
        }
    };

    const sortedDeals = data?.deals ? [...data.deals].sort((a, b) => {
        if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
        // Default: Score (Badges are strings, so we map them to values)
        const scoreVal = { great: 3, good: 2, bad: 1 };
        return (scoreVal[b.score] || 0) - (scoreVal[a.score] || 0);
    }) : [];

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <section className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center p-6 ${data ? 'py-12 min-h-[40vh]' : 'min-h-[80vh]'}`}>
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-4 max-w-3xl mx-auto mb-10"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold text-carbon tracking-tight">
                        Is this PC <span className="text-primary">overpriced?</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Instantly scan the Algerian market. Spot the scams. Find the steals.
                    </p>
                </motion.div>

                <HeroSearch onSearch={handleScan} isLoading={loading} />

                {/* Loading State Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-8 text-primary font-medium flex flex-col items-center gap-2"
                        >
                            <p className="animate-pulse">Searching Ouedkniss...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mt-8 p-4 bg-error-bg text-error-text rounded-xl border border-error/20 flex items-center gap-3 shadow-sm max-w-md"
                        >
                            <AlertCircle size={24} />
                            <p className="font-medium">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Results Section */}
            <AnimatePresence>
                {data && (
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex-1 bg-white rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12"
                    >
                        <div className="max-w-7xl mx-auto">
                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Analysis Report</p>
                                    <h2 className="text-3xl font-bold text-carbon">{data.model}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-500">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-gray-100 border-none text-sm font-semibold text-carbon rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="score">Best Value</option>
                                        <option value="price_asc">Lowest Price</option>
                                        <option value="price_desc">Highest Price</option>
                                    </select>
                                </div>
                            </div>

                            <StatsTicker
                                avg={data.avg}
                                min={data.min}
                                max={data.max}
                                count={data.deals?.length}
                            />

                            {/* Empty State or Grid */}
                            {sortedDeals.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="inline-flex p-4 bg-white rounded-full shadow-sm mb-4 text-slate-300">
                                        <Search size={48} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700">No listings found</h3>
                                    <p className="text-slate-500 mt-2">Try searching for a shorter model name (e.g. "ThinkPad" instead of "Lenovo ThinkPad X1 Carbon Gen 9")</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {sortedDeals.map((deal, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <DealCard {...deal} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
}
