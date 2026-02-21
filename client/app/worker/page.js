"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WorkerDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user === null) return; // Wait for auth to initialize
        if (!user || (user.role !== 'worker' && user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, router]);
    const [formData, setFormData] = useState({
        category: 'Laptop',
        cpu: '',
        gpu: '',
        ram: '',
        storage: '',
        metadata: '', // JSON string for UI (e.g. batteryHealth)
        condition: 'Used',
        listingUrl: '',
        listedPrice: '',
        proofUrl: ''
    });
    const [status, setStatus] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMetadataChange = (key, value) => {
        let metaObj = {};
        try {
            metaObj = formData.metadata ? JSON.parse(formData.metadata) : {};
        } catch (e) {
            metaObj = {};
        }
        metaObj[key] = value;
        setFormData({ ...formData, metadata: JSON.stringify(metaObj) });
    };

    const getMetadataValue = (key) => {
        try {
            return formData.metadata ? JSON.parse(formData.metadata)[key] || '' : '';
        } catch (e) {
            return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', text: 'Saving marketplace listing...' });

        try {
            await axios.post('http://localhost:5000/api/intelligence-units', formData);
            setStatus({ type: 'success', text: 'Listing submitted for Admin review!' });
            // Reset input fields to keep typing new units fast
            setFormData(prev => ({ ...prev, listingUrl: '', listedPrice: '', proofUrl: '', metadata: '' }));
        } catch (error) {
            setStatus({ type: 'error', text: error.response?.data?.error || 'Failed to submit listing.' });
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-carbon mb-2">Worker Data Entry</h1>
                <p className="text-slate-500 mb-8">Submit raw marketplace listings to build the database.</p>

                {status.text && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-success/10 text-success' : status.type === 'error' ? 'bg-error-bg text-error-text' : 'bg-blue-50 text-blue-600'}`}>
                        {status.type === 'error' && <AlertCircle size={20} />}
                        {status.type === 'success' && <CheckCircle size={20} />}
                        <p className="font-medium">{status.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary">
                                <option>Laptop</option>
                                <option>Desktop</option>
                                <option>Phone</option>
                                <option>Scooter</option>
                                <option>PC Part</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary">
                                <option>Used</option>
                                <option>New</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {(formData.category === 'Laptop' || formData.category === 'Desktop' || formData.category === 'PC Part' || formData.category === 'Phone') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{formData.category === 'Phone' ? 'Model (e.g. iPhone 13 Pro)' : 'CPU / Main Model Component'}</label>
                                <input required name="cpu" placeholder="e.g. i5-1145G7" value={formData.cpu} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                            </div>
                        )}

                        {(formData.category === 'Laptop' || formData.category === 'Desktop') && (
                            <>
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
                            </>
                        )}

                        {formData.category === 'Phone' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Storage</label>
                                    <input required name="storage" placeholder="e.g. 128GB" value={formData.storage} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Battery Health (%)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 85"
                                        value={getMetadataValue('batteryHealth')}
                                        onChange={(e) => handleMetadataChange('batteryHealth', e.target.value)}
                                        className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary"
                                    />
                                </div>
                            </>
                        )}

                        {formData.category === 'Scooter' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                                    <input required name="cpu" placeholder="e.g. Xiaomi Pro 2" value={formData.cpu} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mileage (km)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1500"
                                        value={getMetadataValue('mileage')}
                                        onChange={(e) => handleMetadataChange('mileage', e.target.value)}
                                        className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Worker Listing Link</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link (Ouedkniss/Marketplace)</label>
                                <input name="listingUrl" required placeholder="https://..." value={formData.listingUrl} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Listed Price (DA)</label>
                                <input required type="number" name="listedPrice" placeholder="e.g. 120000" value={formData.listedPrice} onChange={handleChange} className="w-full border border-primary/30 rounded-lg p-3 outline-none focus:border-primary" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Screenshot Proof URL (Optional if Price is visible in Link)</label>
                                <input name="proofUrl" placeholder="Imgur / Drive Link..." value={formData.proofUrl || ''} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-lg p-3 outline-none focus:border-primary" />
                                <p className="text-xs text-slate-400 mt-1">If the listing does not include a price (e.g. "Contact seller"), contact them and upload a screenshot of their response here.</p>
                            </div>
                        </div>
                    </div>

                    <button disabled={status.type === 'loading'} type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-btn transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                        <Save size={20} />
                        Submit Listing for Admin Review
                    </button>
                </form>
            </div>
        </main>
    );
}
