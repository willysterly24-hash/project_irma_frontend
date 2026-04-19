import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout'; 
import { MOCK_USERS } from './Users';

const ForgotIllustration = () => (
    <div className="relative flex flex-col items-center justify-center h-full text-center px-8 text-white">
        <div className="w-44 h-44 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        </div>
        <h2 className="text-3xl font-black mb-3 tracking-tight">Mot de passe oublié ?</h2>
        <p className="opacity-80 text-sm leading-relaxed max-w-xs font-medium">
            Entrez votre email et nous vous enverrons les instructions pour réinitialiser votre accès.
        </p>
    </div>
);

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        await new Promise(res => setTimeout(res, 1000));

        const exists = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!exists) {
            setError("Aucun compte associé à cet email.");
            setLoading(false);
            return;
        }

        setLoading(false);
        setSent(true);
    };

    return (
        <AuthLayout 
            title="Récupération" 
            subtitle="Identifiez-vous"
            illustration={<ForgotIllustration />} 
            accentBg="bg-slate-800"
        >
            <div className="w-full">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8 transition-colors">
                    ← Retour au login
                </Link>

                {sent ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mb-6 border border-green-100">
                            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 mb-3">Email envoyé !</h1>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8">
                            Un lien de récupération a été envoyé à <br/>
                            <strong className="text-slate-800">{email}</strong>
                        </p>
                        <button
                            onClick={() => { setSent(false); setEmail(''); }}
                            className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                            Renvoyer l'email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Votre adresse email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold italic flex items-center gap-2">
    <svg 
        xmlns="http://www.w3.org" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        className="w-4 h-4 flex-shrink-0"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
    <span>{error}</span>
</div>

                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "Envoi..." : "Envoyer le lien"}
                        </button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
