import { type ReactNode, useState, useEffect, useRef } from 'react';

interface CardProps {
    children: ReactNode;
    image?: string;
    images?: string[];
    badge?: string;
    favorite?: boolean;
    onFavoriteToggle?: () => void;
    autoPlayInterval?: number;
}

export const Card = ({
                         children,
                         image: initialImage,
                         images = [],
                         badge,
                         favorite = false,
                         onFavoriteToggle,
                         autoPlayInterval = 3000,
                     }: CardProps) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const allImages: string[] = images.length > 0
        ? images
        : (initialImage ? [initialImage] : []);

    const nextImage = () => {
        setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    useEffect(() => {
        if (allImages.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
            }, autoPlayInterval);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [allImages.length, autoPlayInterval]);

    const handleMouseEnter = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const handleMouseLeave = () => {
        if (allImages.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
            }, autoPlayInterval);
        }
    };

    if (allImages.length === 0) return null;

    return (
        <div
            className="group relative bg-white overflow-hidden cursor-pointer rounded-sm shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative overflow-hidden" style={{ height: '320px' }}>
                <img
                    src={allImages[currentImgIndex]}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                        >
                            ◀
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                        >
                            ▶
                        </button>
                    </>
                )}

                {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {allImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImgIndex(i);
                                }}
                                className="w-6 h-1 rounded-full transition-all"
                                style={{ background: currentImgIndex === i ? '#D4A853' : 'rgba(255,255,255,0.5)' }}
                            />
                        ))}
                    </div>
                )}

                {badge && (
                    <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-2.5 py-1.5 z-10">
                        {badge}
                    </div>
                )}

                {onFavoriteToggle && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform active:scale-90"
                        style={{ background: favorite ? '#FEE2E2' : 'rgba(255,255,255,0.9)' }}
                    >
                        <svg className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                )}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
};
