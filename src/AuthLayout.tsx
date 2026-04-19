import { type ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  illustration?: ReactNode; // Optionnel avec ? pour éviter les erreurs
  accentBg?: string;       // Optionnel aussi
}

export default function AuthLayout({ children, title, subtitle, illustration, accentBg = "bg-indigo-600" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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