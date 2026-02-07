import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Server, Smartphone, Globe, CheckCircle, SparklesIcon } from 'lucide-react';
import NeuralBackground from '../components/ui/flow-field-background';
import DatabaseWithRestApi from '../components/ui/database-with-rest-api';
import { ButtonCta } from '../components/ui/button-shiny';

export default function Landing() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <NeuralBackground
                    color="#a855f7" // Purple-500
                    speed={0.8}
                    particleCount={600}
                    trailOpacity={0.15}
                />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-white to-slate-400">
                        SecureVault
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#security" className="hover:text-white transition-colors">Security</a>
                    <a href="#about" className="hover:text-white transition-colors">About</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-sm font-medium transition-all hover:scale-105 active:scale-95">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-medium mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Next-Gen Zero Knowledge Encryption
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                    Silent Security. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Complete Control.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
                    Your data is encrypted before it leaves your device. No trackers, no ads, no backdoors. Just pure, unadulterated privacy.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Link to="/signup" className="group">
                        <ButtonCta
                            label="Secure Upload"
                            className="w-full sm:w-auto min-w-[200px]"
                        />
                    </Link>

                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800/80 hover:border-slate-600 text-white font-semibold backdrop-blur-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <Eye className="w-5 h-5" />
                        View My Data
                    </Link>
                </div>

                {/* Floaties */}
                <div className="absolute top-1/2 left-10 hidden lg:block animate-float">
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl">
                        <Database className="w-6 h-6 text-purple-400 mb-2" />
                        <div className="w-24 h-2 bg-slate-800 rounded-full mb-1" />
                        <div className="w-16 h-2 bg-slate-800 rounded-full" />
                    </div>
                </div>
                <div className="absolute bottom-20 right-10 hidden lg:block animate-float-delayed">
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl">
                        <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                        <div className="text-xs text-slate-400 font-mono">Encrypted</div>
                    </div>
                </div>

            </main>

            {/* Architecture Section */}
            <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text Content */}
                    <div className="text-left space-y-8 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-medium">
                            <SparklesIcon className="w-3 h-3" />
                            <span>Architecture</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                            <span className="text-white">Transparent Security.</span><br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Zero Knowledge.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                            We've reimagined how data storage works. Your files are encrypted individually on your device using keys that only you hold. Our servers only ever see encrypted blobs, never your actual data.
                        </p>

                        <div className="flex flex-col gap-4">
                            {[
                                "Client-side Encryption (AES-256-GCM)",
                                "PBKDF2 Key Derivation (600k iterations)",
                                "Decentralized Storage Pointers"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Animation Card */}
                    <div className="relative group order-1 lg:order-2">
                        {/* Glow Effects */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative rounded-3xl border border-white/5 bg-slate-900/10 backdrop-blur-sm p-8 overflow-hidden">

                            {/* The Animation Component */}
                            <div className="flex justify-center transform scale-90 sm:scale-100 transition-transform">
                                <DatabaseWithRestApi
                                    className="!bg-transparent"
                                    lightColor="#d8b4fe"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Features Grid (Minimal) */}
            <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Lock, title: "Zero Knowledge", desc: "We can't see your data even if we wanted to. Your keys never leave your device." },
                        { icon: Smartphone, title: "Any Device", desc: "Access your encrypted vault from anywhere. Your salt is stored securely on the cloud." },
                        { icon: Globe, title: "Open Source", desc: "Auditable code. No hidden backdoors. Verify the security yourself." }
                    ].map((feature, i) => (
                        <div key={i} className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/40 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-purple-900/10 hover:shadow-2xl hover:shadow-purple-500/30">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner shadow-purple-500/20">
                                <feature.icon className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-slate-400 font-medium">SecureVault &copy; 2026</span>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>

            {/* CSS for custom animations */}
            <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
      `}</style>
        </div>
    );
}
