import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function NewFlipModal({ isOpen, onClose, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initial Form State matching Prisma Schema
    const initialForm = {
        brand: '',
        model: '',
        cpu: '',
        ram: '',
        storage: '',
        gpu: '',
        condition: 'Used',

        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        sellerSource: 'Marketplace',
        repairCost: '0',
        upgradeCost: '0',

        targetResalePrice: '',
        minimumAcceptablePrice: '',
        platformListedOn: '',

        status: 'BOUGHT'
    };

    const [form, setForm] = useState(initialForm);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...form,
                purchasePrice: parseInt(form.purchasePrice) || 0,
                repairCost: parseInt(form.repairCost) || 0,
                upgradeCost: parseInt(form.upgradeCost) || 0,
                targetResalePrice: parseInt(form.targetResalePrice) || 0,
                minimumAcceptablePrice: parseInt(form.minimumAcceptablePrice) || 0,
                purchaseDate: new Date(form.purchaseDate).toISOString()
            };

            await axios.post('http://localhost:5000/api/portfolio', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onRefresh(); // Refresh the parent table
            setForm(initialForm); // Reset form
            onClose(); // Hide modal
        } catch (err) {
            console.error("Failed to add flip:", err);
            setError(err.response?.data?.error || 'Failed to save new flip.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl my-8 overflow-hidden"
                >
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-carbon">Add New Flip to Inventory</h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-carbon transition-colors rounded-full hover:bg-slate-200">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {error && (
                            <div className="mb-6 bg-error-bg text-error-text p-4 rounded-xl flex items-center gap-3 border border-error/20 text-sm font-bold">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column: Specs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Asset Details</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Brand *</label>
                                        <input required name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Lenovo" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Model *</label>
                                        <input required name="model" value={form.model} onChange={handleChange} placeholder="e.g. ThinkPad T14" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">CPU</label>
                                        <input name="cpu" value={form.cpu} onChange={handleChange} placeholder="e.g. i5-1145G7" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">RAM</label>
                                        <input name="ram" value={form.ram} onChange={handleChange} placeholder="e.g. 16GB DDR4" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Storage</label>
                                        <input name="storage" value={form.storage} onChange={handleChange} placeholder="e.g. 512GB SSD" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">GPU</label>
                                        <input name="gpu" value={form.gpu} onChange={handleChange} placeholder="e.g. RTX 3050" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Condition *</label>
                                    <select required name="condition" value={form.condition} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700">
                                        <option value="New in box">New in box</option>
                                        <option value="Like New">Like New</option>
                                        <option value="Used">Used</option>
                                        <option value="Needs Repair">Needs Repair</option>
                                        <option value="Missing Charger">Missing Charger</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column: Financials */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Financials</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Purchase Price (DA) *</label>
                                        <input required type="number" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-carbon bg-slate-50" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Purchase Date *</label>
                                        <input required type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Repair Cost (DA)</label>
                                        <input type="number" name="repairCost" value={form.repairCost} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Upgrade Cost (DA)</label>
                                        <input type="number" name="upgradeCost" value={form.upgradeCost} onChange={handleChange} placeholder="e.g. New SSD" className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700" />
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2 pt-2">Resale Plan</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Target Resale Price *</label>
                                        <input required type="number" name="targetResalePrice" value={form.targetResalePrice} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary bg-primary/5" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Minimum Base Price *</label>
                                        <input required type="number" name="minimumAcceptablePrice" value={form.minimumAcceptablePrice} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-error-text bg-error-bg" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Current Status</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['BOUGHT', 'REPAIRING', 'READY_TO_SELL'].map((s) => (
                                            <button
                                                type="button"
                                                key={s}
                                                onClick={() => setForm({ ...form, status: s })}
                                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${form.status === s ? 'bg-white shadow-sm text-carbon' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {s.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button disabled={loading} type="submit" className="px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50">
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                                <span>Save Flip Asset</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
