import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
    companyName: string;
    domain?: string;
    className?: string; // Class for the image itself
    containerClassName?: string; // Class for the wrapper (e.g., bg-white, rounded-lg)
    fallbackClassName?: string; // Class for the text fallback
    showLabel?: boolean; // Whether to show the hidden accessible label (for screen readers/SEO)
}

export function CompanyLogo({
    companyName,
    domain,
    className = "w-10 h-7 object-contain",
    containerClassName = "w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm",
    fallbackClassName = "text-blue-600 font-bold text-sm",
    showLabel = false
}: CompanyLogoProps) {
    const [error, setError] = useState(false);

    // Derive domain from company name if not provided (simple heuristic)
    const targetDomain = domain || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    // Use Google Favicons as it's highly reliable and rarely blocked
    // Clearbit is often blocked by adblockers causing network errors
    const logoUrl = `https://www.google.com/s2/favicons?domain=${targetDomain}&sz=128`;

    // Generate initials for fallback
    const initials = companyName
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 3)
        .toUpperCase();

    return (
        <div className={containerClassName}>
            {!error ? (
                <img
                    src={logoUrl}
                    alt={`${companyName} Logo`}
                    className={className}
                    onError={() => setError(true)}
                />
            ) : (
                <span className={fallbackClassName}>
                    {initials}
                </span>
            )}
            {showLabel && <span className="sr-only">{companyName}</span>}
        </div>
    );
}
