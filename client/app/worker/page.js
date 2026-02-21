"use client";

import { useState } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function WorkerDashboard() {
    const [formData, setFormData] = useState({
        category: 'Laptop',
        cpu: '',
        gpu: '',
        ram: '',
        storage: '',
        condition: 'Used',
        minPrice: '',
        avgPrice: '',
        maxPrice: '',
        dealThreshold: '',
        confidenceScore: 10
    });
    const [status, setStatus] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', text: 'Saving intelligence unit...' });

        try {
            const dataToSubmit = {
                ...formData,
                minPrice: parseInt(formData.minPrice),
                avgPrice: parseInt(formData.avgPrice),
                maxPrice: parseInt(formData.maxPrice),
                dealThreshold: parseInt(formData.dealThreshold),
                confidenceScore: parseInt(formData.confidenceScore)
            };

            await axios.post('http://localhost:5000/api/intelligence-units', dataToSubmit);
            setStatus({ type: 'success', text: 'Intelligence unit saved successfully!' });
            // Reset numerical fields to keep typing new units fast
            setFormData(prev => ({ ...prev, minPrice: '', avgPrice: '', maxPrice: '', dealThreshold: '', proofUrl: '' }));
        } catch (error) {
            setStatus({ type: 'error', text: error.response?.data?.error || 'Failed to save unit.' });
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-carbon mb-2">Worker Data Entry</h1>
                <p className="text-slate-500 mb-8">Enter analyzed market data points to power the Smart Search.</p>

                {status.text && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-success/10 text-success' : status.type === 'error' ? 'bg-error-bg text-error-text' : 'bg-blue-50 text-blue-600'}`}>
                        {status.type === 'error' && <AlertCircle size={20} />}
                        {status.type === 'success' && <CheckCircle size={20} />}
                        <p className="font-medium">{status.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary">
                                <option>Laptop</option>
                                <option>Desktop</option>
                                <option>Phone</option>
                                <option>Accessory</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary">
                                <option>Used</option>
                                <option>New</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Proof URL (Imgur/Drive)</label>
                            <input name="proofUrl" placeholder="Optional" value={formData.proofUrl || ''} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CPU</label>
                            <input required name="cpu" placeholder="e.g. i5-1145G7" value={formData.cpu} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">GPU</label>
                            <input name="gpu" placeholder="e.g. Iris Xe" value={formData.gpu} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
                            <input required name="ram" placeholder="e.g. 16GB" value={formData.ram} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Storage</label>
                            <input name="storage" placeholder="e.g. 512GB" value={formData.storage} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pricing Intel (DA)</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Min Price</label>
                                <input required type="number" name="minPrice" value={formData.minPrice} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Avg Price</label>
                                <input required type="number" name="avgPrice" value={formData.avgPrice} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Max Price</label>
                                <input required type="number" name="maxPrice" value={formData.maxPrice} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-primary" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-success mb-1">Deal Threshold (Good Deal)</label>
                                <input required type="number" name="dealThreshold" value={formData.dealThreshold} onChange={handleChange} className="w-full border border-success/30 rounded-lg p-3 outline-none focus:ring-2 focus:ring-success/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-warning mb-1">Confidence (# of listings checked)</label>
                                <input required type="number" name="confidenceScore" value={formData.confidenceScore} onChange={handleChange} className="w-full border border-warning/30 rounded-lg p-3 outline-none focus:ring-2 focus:ring-warning/20" />
                            </div>
                        </div>
                    </div>

                    <button disabled={status.type === 'loading'} type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-btn transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                        <Save size={20} />
                        Save Intelligence Unit
                    </button>
                </form>
            </div>
        </main>
    );
}
