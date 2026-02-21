"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, TrendingUp, AlertCircle, Clock, CheckCircle, Tag, Settings, CreditCard } from 'lucide-react';

// Assuming we will place NewFlipModal here next
import NewFlipModal from '../../components/portfolio/NewFlipModal';

export default function PortfolioPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            setError('Failed to load portfolio.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!user) return null; // Let the useEffect redirect it

    const formatMetrics = () => {
        let totalInvested = 0;
        let activeValue = 0;

        assets.forEach(asset => {
            if (asset.status !== 'SOLD') {
                totalInvested += asset.purchasePrice + asset.repairCost + asset.upgradeCost + asset.extraCosts;
                activeValue += asset.targetResalePrice;
            }
        });

        return { totalInvested, activeValue, activeCount: assets.filter(a => a.status !== 'SOLD').length };
    };

    const metrics = formatMetrics();

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-carbon rounded-xl text-white">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-carbon">Your Portfolio</h1>
                            <p className="text-sm font-medium text-slate-500">Manage your active inventory and track profits.</p>
                        </div>
                    </div>

                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        <Plus size={20} />
                        <span>Add New Flip</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-8">

                {/* Error Banner */}
                {error && (
                    <div className="bg-error-bg text-error-text p-4 rounded-xl flex items-center gap-3 border border-error/20">
                        <AlertCircle size={20} />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CreditCard size={16} /> Locked Capital
                        </div>
                        <div className="text-3xl font-black text-carbon">{metrics.totalInvested.toLocaleString()} DA</div>
                        <p className="text-xs font-bold text-slate-500 mt-2">Money currently tied up in active flips</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <TrendingUp size={16} /> Projected Gross
                        </div>
                        <div className="text-3xl font-black text-primary">{metrics.activeValue.toLocaleString()} DA</div>
                        <p className="text-xs font-bold text-slate-500 mt-2">Target value of active inventory</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-carbon/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Tag size={16} /> Active Assets
                        </div>
                        <div className="text-3xl font-black text-carbon">{metrics.activeCount}</div>
                        <p className="text-xs font-bold text-slate-500 mt-2">Total unshipped items in inventory</p>
                    </div>
                </div>

                {/* Active Inventory UI */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-bold text-carbon">Active Inventory</h2>
                    </div>

                    {assets.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">No active flips found.</h3>
                            <p className="text-slate-500 mb-6 max-w-sm">Start tracking your business by adding your first newly purchased asset.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-sm text-slate-400 uppercase tracking-widest border-b border-gray-100">
                                        <th className="p-4 font-bold text-left">Asset</th>
                                        <th className="p-4 font-bold text-left">Status</th>
                                        <th className="p-4 font-bold text-left">Invested</th>
                                        <th className="p-4 font-bold text-left">Target Resale</th>
                                        <th className="p-4 font-bold text-left">Margin</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset) => {
                                        const invested = asset.purchasePrice + asset.repairCost + asset.upgradeCost + asset.extraCosts;
                                        const expectedMargin = asset.targetResalePrice - invested;

                                        // Status badge logic
                                        let statusColors = 'bg-slate-100 text-slate-600';
                                        let StatusIcon = Settings;
                                        if (asset.status === 'READY_TO_SELL') { statusColors = 'bg-blue-100 text-blue-700'; StatusIcon = CheckCircle; }
                                        if (asset.status === 'LISTED') { statusColors = 'bg-purple-100 text-purple-700'; StatusIcon = Tag; }
                                        if (asset.status === 'NEGOTIATING') { statusColors = 'bg-orange-100 text-orange-700'; StatusIcon = Clock; }
                                        if (asset.status === 'SOLD') { statusColors = 'bg-success/20 text-success'; StatusIcon = Briefcase; }

                                        return (
                                            <tr key={asset.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-carbon">{asset.brand} {asset.model}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{asset.cpu} {asset.ram && `• ${asset.ram}`} {asset.storage && `• ${asset.storage}`}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors}`}>
                                                        <StatusIcon size={12} />
                                                        {asset.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-black text-carbon">{invested.toLocaleString()} DA</td>
                                                <td className="p-4 font-bold text-slate-600">{asset.targetResalePrice.toLocaleString()} DA</td>
                                                <td className="p-4 font-black text-primary">+{expectedMargin.toLocaleString()} DA</td>
                                                <td className="p-4 text-right">
                                                    <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Edit</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <NewFlipModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchPortfolio} />
            </main>
        </div>
    );
}
