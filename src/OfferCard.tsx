interface OfferCardProps {
    badge: string;
    title: string;
    desc: string;
    img: string;
    expires: string;
    onButtonClick: () => void;
}

export const OfferCard = ({
                              badge,
                              title,
                              desc,
                              img,
                              expires,
                              onButtonClick,
                          }: OfferCardProps) => {
    return (
        <div
            className="relative overflow-hidden cursor-pointer group"
            style={{ height: '440px', borderRadius: '4px' }}
        >
            <img
                src={img}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                onError={(e) => {
                    (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80';
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)',
                }}
            />
            <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div
                    className="self-start"
                    style={{
                        background: '#D4A853',
                        color: '#0F172A',
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        padding: '5px 12px',
                        borderRadius: '2px',
                    }}
                >
                    {badge}
                </div>
                <div>
                    <h3
                        className="text-white mb-2"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: '26px',
                            fontWeight: '400',
                        }}
                    >
                        {title}
                    </h3>
                    <p className="text-white/60 mb-5" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                        {desc}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-white/40" style={{ fontSize: '11px' }}>
                            Expire le {expires}
                        </span>
                        <button
                            onClick={onButtonClick}
                            style={{
                                color: '#D4A853',
                                border: '1px solid #D4A853',
                                fontSize: '10px',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                padding: '8px 18px',
                                borderRadius: '2px',
                                transition: 'all 0.2s',
                                background: 'transparent',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#D4A853';
                                e.currentTarget.style.color = '#0F172A';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#D4A853';
                            }}
                        >
                            En profiter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};