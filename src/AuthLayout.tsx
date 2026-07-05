import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  illustration?: ReactNode; // Optionnel avec ? pour éviter les erreurs
  accentBg?: string;       // Optionnel aussi
}

export default function AuthLayout({ children, title, subtitle, illustration, accentBg = "bg-indigo-600" }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
        title="Retour à l'accueil"
      >
        <svg width="20" height="20" fill="none" stroke="#D4A853" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5H9v5a1 1 0 01-1 1H3a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl flex overflow-hidden">
        {illustration && (
          <div className={`hidden md:flex md:w-1/2 ${accentBg} p-12 items-center justify-center text-white`}>
            {illustration}
          </div>
        )}
        <div className={`w-full ${illustration ? 'md:w-1/2' : ''} p-8 md:p-16`}>
          <h1 className="text-3xl font-black mb-2">{title}</h1>
          <p className="text-slate-400 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}