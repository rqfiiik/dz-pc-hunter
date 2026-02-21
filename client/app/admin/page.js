"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Edit3, XCircle, Database, CalendarClock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user === null) return; // Wait for auth
        if (!user || user.role !== 'admin') {
            router.push('/');
        }
    }, [user, router]);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'review'
    const [pendingUnits, setPendingUnits] = useState([]);
    const [outdatedUnits, setOutdatedUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, outdatedRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/pending'),
                axios.get('http://localhost:5000/api/admin/outdated')
            ]);
            setPendingUnits(pendingRes.data);
            setOutdatedUnits(outdatedRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id, specs) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/approve/${id}`, specs);
            setPendingUnits(prev => prev.filter(u => u.id !== id));
            setEditingId(null);
        } catch (error) {
            alert('Failed to approve unit.');
        }
    };

    const handleUpdatePrices = async (id, prices) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/update-prices/${id}`, {
                minPrice: parseInt(prices.minPrice),
                avgPrice: parseInt(prices.avgPrice),
                maxPrice: parseInt(prices.maxPrice),
                dealThreshold: parseInt(prices.dealThreshold),
            });
            setOutdatedUnits(prev => prev.filter(u => u.id !== id));
            setEditingId(null);
        } catch (error) {
            alert('Failed to update prices.');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="text-primary w-8 h-8" />
                    <h1 className="text-3xl font-bold text-carbon">QC Dashboard</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'inbox' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Pending Inbox
                        {pendingUnits.length > 0 && <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full">{pendingUnits.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'review' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <CalendarClock size={16} /> Market Review
                        {outdatedUnits.length > 0 && <span className="bg-warning text-white text-xs px-2 py-0.5 rounded-full">{outdatedUnits.length}</span>}
                    </button>
                </div>

                {loading ? (
                    <p className="text-slate-500 animate-pulse">Loading data...</p>
                ) : activeTab === 'inbox' ? (
                    // --------------------------------------------------------
                    // INBOX TAB
                    // --------------------------------------------------------
                    pendingUnits.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
                            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-bold text-slate-700">Inbox Zero</h2>
                            <p className="text-slate-500 mt-2">All worker submissions have been reviewed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingUnits.map(unit => {
                                const workerLink = unit.productLinks?.[0]; // The link the worker submitted

                                return (
                                    <div key={unit.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all">

                                        {editingId === unit.id ? (
                                            <div className="flex-1 w-full space-y-4">
                                                {/* Specs Normalization */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <input className="border p-2 rounded focus:border-primary outline-none" value={editForm.cpu} onChange={e => setEditForm({ ...editForm, cpu: e.target.value })} placeholder="CPU" />
                                                    <input className="border p-2 rounded focus:border-primary outline-none" value={editForm.gpu} onChange={e => setEditForm({ ...editForm, gpu: e.target.value })} placeholder="GPU" />
                                                    <input className="border p-2 rounded focus:border-primary outline-none" value={editForm.ram} onChange={e => setEditForm({ ...editForm, ram: e.target.value })} placeholder="RAM" />
                                                    <input className="border p-2 rounded focus:border-primary outline-none" value={editForm.storage} onChange={e => setEditForm({ ...editForm, storage: e.target.value })} placeholder="Storage" />
                                                </div>

                                                {/* Admin Pricing Input */}
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Min Price</label>
                                                        <input type="number" className="w-full border p-2 rounded text-sm focus:border-primary outline-none" value={editForm.minPrice} onChange={e => setEditForm({ ...editForm, minPrice: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Avg Price</label>
                                                        <input type="number" className="w-full border p-2 rounded text-sm focus:border-primary outline-none" value={editForm.avgPrice} onChange={e => setEditForm({ ...editForm, avgPrice: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Max Price</label>
                                                        <input type="number" className="w-full border p-2 rounded text-sm focus:border-primary outline-none" value={editForm.maxPrice} onChange={e => setEditForm({ ...editForm, maxPrice: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-success mb-1 block">Deal Threshold</label>
                                                        <input type="number" className="w-full border-success/30 p-2 rounded text-sm focus:ring focus:ring-success/20 outline-none" value={editForm.dealThreshold} onChange={e => setEditForm({ ...editForm, dealThreshold: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-warning mb-1 block">Confidence (1-100)</label>
                                                        <input type="number" className="w-full border-warning/30 p-2 rounded text-sm focus:ring focus:ring-warning/20 outline-none" value={editForm.confidenceScore} onChange={e => setEditForm({ ...editForm, confidenceScore: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">{unit.category}</span>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">{unit.condition}</span>
                                                    {unit.proofUrl && (
                                                        <a href={unit.proofUrl} target="_blank" className="text-xs font-bold text-primary underline ml-2">View Worker Screenshot</a>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-carbon">
                                                    {unit.cpu} • {unit.gpu || 'No GPU'} • {unit.ram} • {unit.storage || 'No Storage'}
                                                </h3>

                                                {workerLink && (
                                                    <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between text-sm">
                                                        <div>
                                                            <span className="text-blue-600 font-bold uppercase text-xs tracking-wider block mb-0.5">Worker Listing Check</span>
                                                            <a href={workerLink.url} target="_blank" className="text-slate-600 hover:text-blue-600 underline truncate max-w-xs inline-block" title={workerLink.url}>{workerLink.url}</a>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-slate-400 font-medium text-xs uppercase block">Listed For</span>
                                                            <span className="font-bold text-carbon text-lg">{workerLink.price.toLocaleString()} DA</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            {editingId === unit.id ? (
                                                <>
                                                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                                        <XCircle size={20} />
                                                    </button>
                                                    <button onClick={() => handleApprove(unit.id, editForm)} disabled={!editForm.minPrice || !editForm.avgPrice || !editForm.maxPrice || !editForm.dealThreshold} className="flex-1 md:flex-none bg-success text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50">
                                                        Confirm
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => {
                                                        // Initialize the form with empty prices so the admin is forced to enter them.
                                                        setEditForm({
                                                            cpu: unit.cpu || '', gpu: unit.gpu || '', ram: unit.ram || '', storage: unit.storage || '',
                                                            minPrice: '', avgPrice: '', maxPrice: '', dealThreshold: '', confidenceScore: 10
                                                        });
                                                        setEditingId(unit.id);
                                                    }} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                                                        <Edit3 size={20} />
                                                    </button>
                                                    <button onClick={() => {
                                                        setEditForm({
                                                            cpu: unit.cpu || '', gpu: unit.gpu || '', ram: unit.ram || '', storage: unit.storage || '',
                                                            minPrice: '', avgPrice: '', maxPrice: '', dealThreshold: '', confidenceScore: 10
                                                        });
                                                        setEditingId(unit.id);
                                                    }} className="flex-1 md:flex-none bg-carbon text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-black transition-colors">
                                                        Process Intel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                ) : (
                    // --------------------------------------------------------
                    // MARKET REVIEW TAB
                    // --------------------------------------------------------
                    outdatedUnits.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
                            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-bold text-slate-700">Market is Up To Date</h2>
                            <p className="text-slate-500 mt-2">No intelligence units are older than 30 days.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {outdatedUnits.map(unit => (
                                <div key={unit.id} className="bg-white p-6 rounded-xl border border-warning/20 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all">

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">{unit.category}</span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">{unit.condition}</span>
                                            <span className="text-xs font-bold text-warning flex items-center gap-1 ml-2">
                                                <CalendarClock size={12} /> Outdated
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-carbon">
                                            {unit.cpu} • {unit.gpu || 'No GPU'} • {unit.ram} • {unit.storage || 'No Storage'}
                                        </h3>

                                        {/* Edit Prices Form Inline */}
                                        {editingId === unit.id ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 w-full">
                                                <div>
                                                    <label className="text-xs text-slate-500">Min Price</label>
                                                    <input type="number" className="w-full border p-2 rounded focus:border-primary outline-none text-sm" value={editForm.minPrice} onChange={e => setEditForm({ ...editForm, minPrice: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Avg Price</label>
                                                    <input type="number" className="w-full border p-2 rounded focus:border-primary outline-none text-sm" value={editForm.avgPrice} onChange={e => setEditForm({ ...editForm, avgPrice: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Max Price</label>
                                                    <input type="number" className="w-full border p-2 rounded focus:border-primary outline-none text-sm" value={editForm.maxPrice} onChange={e => setEditForm({ ...editForm, maxPrice: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-success font-bold">Deal Threshold</label>
                                                    <input type="number" className="w-full border-success/50 border p-2 rounded focus:ring focus:ring-success/20 outline-none text-sm" value={editForm.dealThreshold} onChange={e => setEditForm({ ...editForm, dealThreshold: e.target.value })} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4 mt-2 text-sm text-slate-500 font-medium">
                                                <span>Min: {unit.minPrice.toLocaleString()} DA</span>
                                                <span>Avg: {unit.avgPrice.toLocaleString()} DA</span>
                                                <span>Max: {unit.maxPrice.toLocaleString()} DA</span>
                                                <span className="text-success font-bold">Deal: {unit.dealThreshold.toLocaleString()} DA</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        {editingId === unit.id ? (
                                            <>
                                                <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                                    <XCircle size={20} />
                                                </button>
                                                <button onClick={() => handleUpdatePrices(unit.id, editForm)} className="flex-1 md:flex-none bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-primary-hover transition-colors flex items-center gap-2">
                                                    <RefreshCw size={16} /> Save & Refresh
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => {
                                                setEditForm({ minPrice: unit.minPrice, avgPrice: unit.avgPrice, maxPrice: unit.maxPrice, dealThreshold: unit.dealThreshold });
                                                setEditingId(unit.id);
                                            }} className="flex-1 md:flex-none border border-slate-200 text-carbon hover:border-primary hover:text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                                                <Edit3 size={16} /> Update Prices
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
