"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.token, res.data.user);
            router.push('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to back in');
        } finally {
            setLoading(false);
        }
    };

    const googleLoginFlow = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            setError('');
            try {
                // Fetch user info from Google (we need the id_token to verify on backend)
                // Note: useGoogleLogin by default returns an access_token. 
                // We'll fetch the user info using the access_token, then pass it to our backend.
                const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                // For simplicity in MVP, we can just send the access_token to our backend 
                // and let the backend verify it against the Google API (or verify the id_token if we used credential flow)
                // But since our backend expects an ID token in the current implementation, we should adjust it 
                // or send the email directly if we trust the client (not recommended).
                // 
                // Alternatively, we can use the credential flow for Google.
                // Let's modify our backend to accept the access token and fetch user info, similar to Facebook.

                const res = await axios.post('http://localhost:5000/api/auth/google', {
                    accessToken: tokenResponse.access_token
                });
                login(res.data.token, res.data.user);
                router.push('/');
            } catch (err) {
                console.error("Google login error:", err);
                setError('Google validation failed on server');
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: () => setError('Google login failed'),
    });

    const handleFacebookResponse = async (response) => {
        if (response.accessToken) {
            setLoading(true);
            setError('');
            try {
                const res = await axios.post('http://localhost:5000/api/auth/facebook', {
                    accessToken: response.accessToken
                });
                login(res.data.token, res.data.user);
                router.push('/');
            } catch (err) {
                console.error("Facebook login error:", err);
                setError('Facebook validation failed on server');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Facebook login failed');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-carbon">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to access Algerian market intelligence.</p>
                </div>

                {error && (
                    <div className="bg-error-bg text-error-text p-4 rounded-lg flex items-center gap-3 mb-6">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-primary transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-primary transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-carbon text-white font-bold py-3 rounded-lg mt-4 hover:bg-black transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => googleLoginFlow()}
                            disabled={loading || isGoogleLoading}
                            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 font-bold transition-all disabled:opacity-50"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            {isGoogleLoading ? 'Loading...' : 'Google'}
                        </button>

                        <FacebookLogin
                            appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "1234567890"}
                            autoLoad={false}
                            fields="name,email,picture"
                            callback={handleFacebookResponse}
                            render={renderProps => (
                                <button
                                    onClick={renderProps.onClick}
                                    disabled={loading}
                                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 font-bold transition-all disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                                    </svg>
                                    Facebook
                                </button>
                            )}
                        />
                    </div>
                </div>

                <p className="text-center text-sm text-slate-500 mt-8">
                    Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Get Started</Link>
                </p>
            </div>
        </main>
    );
}
