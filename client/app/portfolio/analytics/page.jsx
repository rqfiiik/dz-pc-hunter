"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PieChart, BarChart2, TrendingUp, Calendar, DollarSign, Activity, Percent } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioAnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchPortfolio();
        }
    }, [user, authLoading, router]);

    const fetchPortfolio = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/portfolio', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssets(response.data);
        } catch (err) {
            console.error('Failed to load portfolio:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!user) return null;

    // --- Analytics Logic ---
    const soldAssets = assets.filter(a => a.status === 'SOLD');
    const activeAssets = assets.filter(a => a.status !== 'SOLD');

    const totalRevenue = soldAssets.reduce((sum, a) => sum + (a.soldPrice || 0), 0);
    const totalCosts = soldAssets.reduce((sum, a) => sum + a.purchasePrice + a.repairCost + a.upgradeCost + a.extraCosts, 0);
    const netProfit = totalRevenue - totalCosts;

    // Average ROI
    const avgROI = totalCosts > 0 ? ((netProfit / totalCosts) * 100).toFixed(1) : 0;

    // Average Time to Sell
    let totalDaysToSell = 0;
    let completedSalesWithDates = 0;

    soldAssets.forEach(a => {
        if (a.purchaseDate && a.saleDate) {
            const start = new Date(a.purchaseDate);
            const end = new Date(a.saleDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDaysToSell += diffDays;
            completedSalesWithDates++;
        }
    });

    const avgTimeToSell = completedSalesWithDates > 0 ? (totalDaysToSell / completedSalesWithDates).toFixed(1) : 0;

    // Active Capital
    const activeCapital = activeAssets.reduce((sum, a) => sum + a.purchasePrice + a.repairCost + a.upgradeCost + a.extraCosts, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-carbon">Performance Intelligence</h1>
                            <p className="text-sm font-medium text-slate-500">Track profits, ROI, and capital efficiency.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/portfolio" className="px-6 py-2 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            Back to Inventory
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-8">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Net Profit */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-success/10 text-success rounded-lg">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Profit</h3>
                        <div className="text-3xl font-black text-carbon">{netProfit.toLocaleString()} <span className="text-lg text-slate-400">DA</span></div>
                        <p className="text-xs font-bold text-success mt-2">Historic realized profit</p>
                    </div>

                    {/* Average ROI */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Percent size={20} />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Average ROI</h3>
                        <div className="text-3xl font-black text-carbon">{avgROI}%</div>
                        <p className="text-xs font-bold text-slate-500 mt-2">Return on invested capital</p>
                    </div>

                    {/* Turnaround Time */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <Calendar size={20} />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Avg Time to Sell</h3>
                        <div className="text-3xl font-black text-carbon">{avgTimeToSell} <span className="text-lg text-slate-400">Days</span></div>
                        <p className="text-xs font-bold text-slate-500 mt-2">From purchase to final sale</p>
                    </div>

                    {/* Active Capital */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Activity size={20} />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Active Capital</h3>
                        <div className="text-3xl font-black text-carbon">{activeCapital.toLocaleString()} <span className="text-lg text-slate-400">DA</span></div>
                        <p className="text-xs font-bold text-slate-500 mt-2">Currently tied up in inventory</p>
                    </div>
                </div>

                {/* Sold Assets Ledger */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-bold text-carbon">Completed Sales Ledger</h2>
                    </div>

                    {soldAssets.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No completed sales to analyze yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">
                                        <th className="p-4">Asset</th>
                                        <th className="p-4">Sold Date</th>
                                        <th className="p-4 text-right">Total Cost</th>
                                        <th className="p-4 text-right">Revenue</th>
                                        <th className="p-4 text-right text-success">Net Profit</th>
                                        <th className="p-4 text-center">ROI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {soldAssets.map(asset => {
                                        const cost = asset.purchasePrice + asset.repairCost + asset.upgradeCost + asset.extraCosts;
                                        const rev = asset.soldPrice || 0;
                                        const profit = rev - cost;
                                        const roi = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={asset.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                                                <td className="p-4">
                                                    <div className="font-bold text-carbon">{asset.brand} {asset.model}</div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">
                                                    {asset.saleDate ? new Date(asset.saleDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right font-medium text-slate-600">{cost.toLocaleString()} DA</td>
                                                <td className="p-4 text-right font-bold text-carbon">{rev.toLocaleString()} DA</td>
                                                <td className="p-4 text-right font-black text-success">+{profit.toLocaleString()} DA</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${profit > 0 ? 'bg-success/10 text-success' : 'bg-error-bg text-error-text'}`}>
                                                        {roi}%
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
