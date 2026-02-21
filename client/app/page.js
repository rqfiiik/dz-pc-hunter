"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Search, LineChart, CheckCircle, ShieldAlert } from 'lucide-react';
import { HeroSearch } from '../components/HeroSearch';
import { StatsTicker } from '../components/StatsTicker';
import { DealCard } from '../components/DealCard';
import { MarginCalculator } from '../components/MarginCalculator';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [searchResults, setSearchResults] = useState(null);
    const [parsedQuery, setParsedQuery] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Changed initial state to empty string

    const { user } = useAuth();
    const router = useRouter();
    const calculatorRef = useRef(null);

    // Auto-focus the calculator input to gamify the experience after search
    useEffect(() => {
        if (searchResults?.results?.[0]) {
            setTimeout(() => {
                if (calculatorRef.current) {
                    calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Additional timeout to let the smooth scroll finish before focusing
                    setTimeout(() => calculatorRef.current.focus(), 600);
                }
            }, 800);
        }
    }, [searchResults]);

    const handleSearch = async (query) => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!user.isSubscribed && user.role !== 'admin') {
            router.push('/pricing');
            return;
        }

        setLoading(true);
        setError(''); // Reset error to empty string
        setSearchResults(null);
        setParsedQuery(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParsedQuery(response.data.parsedQuery);
            setSearchResults(response.data); // Store the entire response data
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to fetch results'); // Updated error handling
        } finally {
            setLoading(false);
        }
    };

    const unit = searchResults?.results?.[0]; // Show the best match for now

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <section className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center p-6 ${searchResults ? 'py-12 min-h-[40vh]' : 'min-h-[80vh]'}`}>
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-4 max-w-3xl mx-auto mb-10"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold text-carbon tracking-tight">
                        Algerian <span className="text-primary">Flip Market</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Instantly check true market values. Spot the scams. Find the steals.
                    </p>
                </motion.div>

                <HeroSearch onSearch={handleSearch} isLoading={loading} />

                {/* Parsing Feedback Overlay */}
                <AnimatePresence>
                    {(loading || searchResults) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 text-sm flex gap-2 justify-center flex-wrap max-w-2xl"
                        >
                            {loading ? (
                                <p className="text-primary font-medium flex items-center gap-2 animate-pulse">Running smart search...</p>
                            ) : (
                                searchResults?.parsedQuery && (
                                    <>
                                        <span className="text-slate-400">Parsed:</span>
                                        {Object.entries(searchResults.parsedQuery).map(([key, value]) => value && (
                                            <span key={key} className="bg-white border rounded-full px-3 py-1 text-slate-600 shadow-sm font-medium text-xs uppercase tracking-wider">
                                                {key}: <span className="text-primary">{value}</span>
                                            </span>
                                        ))}
                                    </>
                                )
                            )}
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
                {searchResults && (
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex-1 bg-white rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12"
                    >
                        <div className="max-w-7xl mx-auto">
                            {!unit ? (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="inline-flex p-4 bg-white rounded-full shadow-sm mb-4 text-slate-300">
                                        <Search size={48} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700">No Intelligence Unit Found</h3>
                                    <p className="text-slate-500 mt-2">Try specifying the CPU, GPU, or RAM explicitly.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Header Info */}
                                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Market Scope: {unit.category}</p>
                                            <h2 className="text-3xl font-bold text-carbon">
                                                {unit.category === 'Phone' ? (
                                                    <>{unit.cpu} • {unit.storage} {unit.metadata && JSON.parse(unit.metadata).batteryHealth ? `• ${JSON.parse(unit.metadata).batteryHealth}% Battery` : ''}</>
                                                ) : unit.category === 'Scooter' ? (
                                                    <>{unit.cpu} {unit.metadata && JSON.parse(unit.metadata).mileage ? `• ${JSON.parse(unit.metadata).mileage} km` : ''}</>
                                                ) : (
                                                    <>{unit.cpu} {unit.gpu && `• ${unit.gpu}`} • {unit.ram} • {unit.storage}</>
                                                )} {unit.condition === 'New' ? '(New)' : '(Used)'}
                                            </h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Deal Threshold</p>
                                            <p className="text-2xl font-bold text-success">{unit.dealThreshold?.toLocaleString()} DA</p>
                                        </div>
                                    </div>

                                    <StatsTicker
                                        avg={unit.avgPrice}
                                        min={unit.minPrice}
                                        max={unit.maxPrice}
                                        count={unit.confidenceScore}
                                    />

                                    <MarginCalculator
                                        ref={calculatorRef}
                                        avgPrice={unit.avgPrice}
                                        maxPrice={unit.maxPrice}
                                        dealThreshold={unit.dealThreshold}
                                        confidenceScore={unit.confidenceScore}
                                    />

                                    <h3 className="text-xl font-bold text-carbon mb-6 mt-8">Recent Verified Deals</h3>

                                    {unit.productLinks?.length === 0 ? (
                                        <p className="text-slate-500 text-sm">No recent product links tracked for this spec.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {unit.productLinks?.map((link, idx) => {
                                                const linkScore = link.price <= unit.dealThreshold ? 'great' : (link.price <= unit.avgPrice ? 'good' : 'bad');
                                                return (
                                                    <motion.div
                                                        key={link.id || idx}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                    >
                                                        <DealCard
                                                            title="Verified Market Listing"
                                                            price={link.price}
                                                            link={link.url}
                                                            source="MarketData"
                                                            score={linkScore}
                                                        />
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
}
