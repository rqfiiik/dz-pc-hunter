"use client";

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, Bitcoin, CreditCard, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function Pricing() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) return null;

    if (!user) {
        // Must be logged in to subscribe
        router.push('/login');
        return null;
    }

    if (user.isSubscribed && user.role !== 'admin') {
        router.push('/');
        return null; // Already subscribed
    }

    const handleCryptoPayment = async () => {
        try {
            // Simulated Stripe/NOWPayments successful integration webhook return
            const res = await axios.post('http://localhost:5000/api/payment/success', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Re-authenticate user context with new isSubscribed status 
            // In a real app we might decode the new JWT, here we just force a re-login flow with old token
            alert("Crypto Payment Successful! Pro Access unlocked.");
            window.location.href = '/';
        } catch (e) {
            alert("Payment failed.");
        }
    };

    const handleCardPayment = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/payment/success', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Card Payment Successful! Pro Access unlocked.");
            window.location.href = '/';
        } catch (e) {
            alert("Payment failed.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-extrabold text-carbon tracking-tight mb-4">Unlock the Algerian PC Market</h1>
                <p className="text-lg text-slate-500">Stop guessing prices. Get instant market intelligence and deal thresholds to maximize your flip margins.</p>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-carbon p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">Pro Access</h2>
                    <div className="flex justify-center items-baseline gap-1 my-4">
                        <span className="text-5xl font-extrabold">$8</span>
                        <span className="text-gray-400 font-medium">/month</span>
                    </div>
                    <p className="text-sm text-gray-400">Cancel anytime. Instant activation.</p>
                </div>

                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3 text-slate-700 font-medium">
                            <CheckCircle className="text-success shrink-0" size={20} />
                            Unlimited Smart Searches
                        </li>
                        <li className="flex items-start gap-3 text-slate-700 font-medium">
                            <CheckCircle className="text-success shrink-0" size={20} />
                            Access to Deal Threshold metrics
                        </li>
                        <li className="flex items-start gap-3 text-slate-700 font-medium">
                            <CheckCircle className="text-success shrink-0" size={20} />
                            Verified Min / Avg / Max ranges
                        </li>
                        <li className="flex items-start gap-3 text-slate-700 font-medium">
                            <CheckCircle className="text-success shrink-0" size={20} />
                            Direct links to top Ouedkniss deals
                        </li>
                    </ul>

                    <div className="space-y-3">
                        <button onClick={handleCryptoPayment} className="w-full bg-slate-100 hover:bg-slate-200 text-carbon font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                            <Bitcoin className="text-orange-500" />
                            Pay with Crypto
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase">Or</span></div>
                        </div>

                        <button onClick={handleCardPayment} className="w-full bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                            <CreditCard />
                            Pay with Card
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                    <ShieldCheck size={16} className="text-slate-400" />
                    Secure payments processed by modern gateways
                </div>
            </div>
        </main>
    );
}
