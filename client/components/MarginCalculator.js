"use client";

import { useState, forwardRef } from 'react';
import { Calculator, Flame, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MarginCalculator = forwardRef(({ avgPrice, maxPrice, dealThreshold, confidenceScore = 70 }, ref) => {
    const [cost, setCost] = useState('');

    const costValue = parseInt(cost.replace(/\D/g, ''), 10) || 0;
    const avgProfit = avgPrice - costValue;
    const maxProfit = maxPrice - costValue;

    // Gamification Math
    const calculateDealScore = () => {
        if (costValue === 0) return null;
        if (costValue >= avgPrice) return (0).toFixed(1); // Terrible deal

        const percentageUnderAvg = ((avgPrice - costValue) / avgPrice) * 100;

        // Dynamic Scoring Model
        // 0% under avg = 5.0 (Fair market value)
        // 15% under avg = ~6.5 (Decent)
        // 25% under avg = 7.5 (Good)
        // 40% under avg = 9.0 (Great)
        // 60%+ under avg = 10.0 (Incredible/Steal)

        // Base score starts at 5.0 for anything under average
        let score = 5.0 + (percentageUnderAvg / 12);

        // Cap at 10.0
        if (score > 10) score = 10.0;

        return parseFloat(score).toFixed(1);
    };

    const _score = calculateDealScore();
    const dealScore = _score !== null ? parseFloat(_score) : null;
    const undervaluedPercentage = costValue > 0 && costValue < avgPrice
        ? Math.round(((avgPrice - costValue) / avgPrice) * 100)
        : 0;

    // Status logic
    const isGoodDeal = costValue > 0 && costValue <= dealThreshold;
    const isRisky = costValue > dealThreshold && costValue < avgPrice;
    const isBadDeal = costValue >= avgPrice;

    return (
        <div className="mt-8 space-y-4">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                {/* Background design elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-carbon">Flip Margin Calculator</h3>
                        <p className="text-sm text-slate-500 font-medium">Test a buying price to see your potential flip profit.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div className="flex flex-col justify-center">
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Your Target Buying Price</label>
                        <div className="relative">
                            <input
                                ref={ref}
                                type="text"
                                placeholder="e.g. 150000"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                className="w-full text-3xl font-extrabold text-carbon border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-slate-50/50"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">DA</span>
                        </div>

                        {costValue > 0 && (
                            <div className={`mt-4 text-sm font-bold flex items-center gap-2 ${isGoodDeal ? 'text-success' : isRisky ? 'text-warning' : 'text-error-text'}`}>
                                {isGoodDeal && "✨ Incredible price! Well below the deal threshold."}
                                {isRisky && "⚠️ Risky flip. You are approaching the average market value."}
                                {isBadDeal && "❌ Too expensive. There is little to no margin left here."}
                            </div>
                        )}
                    </div>

                    <div className="bg-carbon rounded-2xl p-6 flex flex-col justify-center space-y-6 shadow-lg">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex pl-2 flex-col text-left">
                                <span className="block text-slate-200 font-medium text-sm mb-1">Est. Profit (Avg Sale)</span>
                                <span className="text-xs text-slate-300">Based on {avgPrice.toLocaleString()} DA</span>
                            </div>
                            <div className={`text-2xl pr-2 text-right font-extrabold ${costValue > 0 && avgProfit > 0 ? 'text-success' : 'text-white'}`}>
                                {costValue > 0 ? `+${avgProfit.toLocaleString()} DA` : '-'}
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/10 my-4"></div>

                        <div className="flex justify-between items-center w-full">
                            <div className="flex pl-2 flex-col text-left">
                                <span className="block text-slate-200 font-medium text-sm mb-1">Max Potential Profit</span>
                                <span className="text-xs text-slate-300">Based on {maxPrice.toLocaleString()} DA</span>
                            </div>
                            <div className={`text-2xl pr-2 text-right font-extrabold ${costValue > 0 && maxProfit > 0 ? 'text-primary' : 'text-white'}`}>
                                {costValue > 0 ? `+${maxProfit.toLocaleString()} DA` : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamified Deal Score Panel */}
            <AnimatePresence>
                {costValue > 0 && dealScore !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`rounded-2xl border-2 p-6 flex flex-col md:flex-row items-center gap-8 ${isGoodDeal ? 'bg-success/5 border-success/20' : isRisky ? 'bg-warning/5 border-warning/20' : 'bg-error-bg/50 border-error/20'}`}>

                            {/* Score Circle */}
                            <div className="flex flex-col items-center justify-center shrink-0">
                                <div className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-2">Deal Score</div>
                                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center shadow-lg bg-white relative
                                    ${dealScore >= 8 ? 'border-success text-success' : dealScore >= 5 ? 'border-warning text-warning' : 'border-error-text text-error-text'}`}>
                                    <span className="text-4xl font-black">{dealScore.toFixed(1)}</span>
                                    <span className="absolute bottom-2 text-xs font-bold opacity-50">/ 10</span>
                                </div>
                            </div>

                            {/* Gamified Insights */}
                            <div className="flex-1 space-y-3 w-full">
                                {undervaluedPercentage > 0 ? (
                                    <div className="flex items-center gap-3 text-sm md:text-base font-bold text-slate-800 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                                        <Flame className="text-orange-500 shrink-0" size={24} />
                                        <span>🔥 Undervalued by <span className="text-success">{undervaluedPercentage}%</span> compared to market average.</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm md:text-base font-bold text-slate-800 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                                        <AlertTriangle className="text-error-text shrink-0" size={24} />
                                        <span>Overpriced by <span className="text-error-text">{Math.abs(undervaluedPercentage)}%</span>. Do not buy!</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-sm md:text-base font-bold text-slate-800 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                                    <Zap className="text-yellow-400 shrink-0" fill="currentColor" size={24} />
                                    <span>⚡ {confidenceScore >= 80 ? 'Extremely High' : confidenceScore >= 50 ? 'High' : 'Moderate'} demand model</span>
                                </div>

                                {dealScore >= 7 && (
                                    <div className="flex items-center gap-3 text-sm md:text-base font-bold text-slate-800 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                                        <TrendingUp className="text-primary shrink-0" size={24} />
                                        <span>📈 Fast resale history at this price point.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
