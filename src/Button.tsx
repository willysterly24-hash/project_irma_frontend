import { type ReactNode, type CSSProperties } from 'react'; // Correction TS1484

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
    type?: 'button' | 'submit';
      className?: string;
}

export const Button = ({
                           children,
                           onClick,
                           variant = 'primary',
                           fullWidth = false,
                           type = 'button',
                       }: ButtonProps) => {
    const variants: Record<'primary' | 'secondary' | 'outline', CSSProperties> = {
        primary: { background: '#0F172A', color: 'white', border: 'none' },
        secondary: { background: '#D4A853', color: '#0F172A', border: 'none' },
        outline: { background: 'transparent', color: '#D4A853', border: '1px solid #D4A853' },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className="font-medium uppercase transition-all duration-200 hover:opacity-90 active:scale-95 flex items-center justify-center"
            style={{
                ...variants[variant],
                fontSize: '11px',
                letterSpacing: '0.12em',
                padding: fullWidth ? '14px' : '10px 24px',
                borderRadius: '2px',
                cursor: 'pointer',
                width: fullWidth ? '100%' : 'auto',
            }}
        >
            {children}
        </button>
    );
};