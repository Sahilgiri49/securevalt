import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Check, X } from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const passwordRequirements = [
        { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
        { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
        { id: 'number', label: 'One number', regex: /[0-9]/ },
        { id: 'special', label: 'One special character', regex: /[^A-Za-z0-9]/ },
    ];

    const getPasswordStrength = (pass: string) => {
        let metCount = 0;
        passwordRequirements.forEach(req => {
            if (req.regex.test(pass)) metCount++;
        });
        return metCount;
    };

    const strength = getPasswordStrength(password);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (strength < 5) {
            return setError('Please meet all password requirements');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            navigate('/');
        } catch (err: any) {
            setError('Failed to create account: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl relative z-10 my-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-slate-400">Set up your secure vault</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-10 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="Strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {strength >= 5 ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <div className="text-xs text-slate-500 font-mono">{strength}/5</div>
                                )}
                            </div>
                        </div>

                        {/* Password Strength Indicators */}
                        <div className="grid grid-cols-1 gap-1 pt-1 ml-1">
                            {passwordRequirements.map((req) => (
                                <div key={req.id} className="flex items-center gap-2 text-xs">
                                    {req.regex.test(password) ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <X className="w-3 h-3 text-slate-600" />
                                    )}
                                    <span className={req.regex.test(password) ? "text-slate-400" : "text-slate-600 transition-colors"}>
                                        {req.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
