"use client";
import { useState } from 'react';
import axios from 'axios';
import { Search, Monitor, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function Home() {
    const [model, setModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!model) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            // Assuming backend runs on port 5000
            const response = await axios.post('http://localhost:5000/scan', { model });
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch deals. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreBadge = (score) => {
        switch (score) {
            case 'great': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">GREAT DEAL</span>;
            case 'good': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">GOOD PRICE</span>;
            case 'bad': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">BAD PRICE</span>;
            default: return null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">🇩🇿 DZ PC Hunter</h1>
                    <p className="text-lg text-gray-600">Algerian PC Deal Intelligence Platform</p>
                </div>

                {/* Search Input */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleScan} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Enter PC Model (e.g. Lenovo ThinkBook G15 Ryzen 5 5500U)"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? 'Scanning...' : 'Hunt Deals'}
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Results */}
                {data && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Average Price</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{data.avg?.toLocaleString()} DA</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Lowest Price</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{data.min?.toLocaleString()} DA</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Highest Price</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{data.max?.toLocaleString()} DA</p>
                            </div>
                        </div>

                        {/* Deals Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Found {data.deals.length} Listings</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Title</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4">Source</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.deals.map((deal, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-900" title={deal.title}>{deal.title}</td>
                                                <td className="px-6 py-4 font-mono">{deal.price?.toLocaleString()} DA</td>
                                                <td className="px-6 py-4">{getScoreBadge(deal.score)}</td>
                                                <td className="px-6 py-4 capitalize">{deal.source}</td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href={deal.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
                                                    >
                                                        View <Monitor size={14} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
