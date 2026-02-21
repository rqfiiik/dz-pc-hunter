"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Package, Activity } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || (!user.isSubscribed && user.role !== 'admin')) {
            router.push('/pricing');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/analytics', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading analytics...</div>;

    const totalUnits = data.reduce((acc, item) => acc + item.units, 0);
    const topCategoryByMargin = [...data].sort((a, b) => b.avgMargin - a.avgMargin)[0];

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-carbon flex items-center gap-3">
                        <Activity className="text-primary" size={32} />
                        Market Analytics
                    </h1>
                    <p className="text-slate-500 mt-2">Macro trends across all verified Intelligence Units.</p>
                </div>

                {/* Macro Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-full text-primary">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Intelligence Units</p>
                            <p className="text-3xl font-extrabold text-carbon">{totalUnits}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 md:col-span-2">
                        <div className="p-4 bg-success/10 rounded-full text-success">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Most Profitable Category</p>
                            {topCategoryByMargin ? (
                                <p className="text-3xl font-extrabold text-carbon">
                                    {topCategoryByMargin.name} <span className="text-success text-2xl font-semibold">(+{topCategoryByMargin.avgMargin.toLocaleString()} DA avg margin)</span>
                                </p>
                            ) : (
                                <p className="text-slate-500">Not enough data.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-carbon mb-6 text-center">Average Profit Margin by Category</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-semibold text-slate-500" />
                                    <YAxis tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} className="text-xs font-semibold text-slate-500" />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => [`${value.toLocaleString()} DA`, 'Avg Margin']}
                                    />
                                    <Bar dataKey="avgMargin" fill="#ff4d00" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-carbon mb-6 text-center">Volume of Intelligence Units</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} className="text-xs font-semibold text-slate-500" />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-xs font-semibold text-slate-500" width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="units" fill="#1e293b" radius={[0, 6, 6, 0]} barSize={24} name="Total Tracked Specs" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
