"use client";

import { useState } from 'react';
import { Calculator } from 'lucide-react';

export function MarginCalculator({ avgPrice, maxPrice, dealThreshold }) {
    const [cost, setCost] = useState('');

    const costValue = parseInt(cost.replace(/\D/g, ''), 10) || 0;
    const avgProfit = avgPrice - costValue;
    const maxProfit = maxPrice - costValue;

    // Status color logic
    const isGoodDeal = costValue > 0 && costValue <= dealThreshold;
    const isRisky = costValue > dealThreshold && costValue < avgPrice;
    const isBadDeal = costValue > 0 && costValue >= avgPrice;

    return (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Calculator size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-carbon">Flip Margin Calculator</h3>
                    <p className="text-sm text-slate-500 font-medium">Calculate your potential profit before buying.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="flex flex-col justify-center">
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Your Buying Price (Cost)</label>
                    <div className="relative">
                        <input
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
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="block text-slate-400 font-medium text-sm mb-1">Est. Profit (Avg Sale)</span>
                            <span className="text-xs text-slate-500">Based on {avgPrice.toLocaleString()} DA</span>
                        </div>
                        <span className={`text-2xl font-extrabold ${costValue > 0 && avgProfit > 0 ? 'text-success' : 'text-white'}`}>
                            {costValue > 0 ? `+${avgProfit.toLocaleString()} DA` : '-'}
                        </span>
                    </div>
                    <div className="w-full h-px bg-white/10"></div>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="block text-slate-400 font-medium text-sm mb-1">Max Potential Profit</span>
                            <span className="text-xs text-slate-500">Based on {maxPrice.toLocaleString()} DA</span>
                        </div>
                        <span className={`text-2xl font-extrabold ${costValue > 0 && maxProfit > 0 ? 'text-primary' : 'text-white'}`}>
                            {costValue > 0 ? `+${maxProfit.toLocaleString()} DA` : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
