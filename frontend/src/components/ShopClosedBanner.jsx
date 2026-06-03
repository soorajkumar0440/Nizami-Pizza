import { MapPin, Phone, Clock } from 'lucide-react';
import './ShopClosedBanner.css';

export default function ShopClosedBanner({ message, settings }) {
    return (
        <div className="shop-closed-banner" role="alert">
            <p className="shop-closed-title">Ordering unavailable</p>
            <p className="shop-closed-msg">{message}</p>
            {settings && (
                <div className="shop-closed-meta">
                    {settings.openingTime && settings.closingTime && (
                        <span><Clock size={14} /> {settings.openingTime} – {settings.closingTime}</span>
                    )}
                    {settings.contactPhone && (
                        <a href={`tel:${settings.contactPhone}`}><Phone size={14} /> {settings.contactPhone}</a>
                    )}
                    {settings.address && (
                        <span><MapPin size={14} /> {settings.address}</span>
                    )}
                </div>
            )}
        </div>
    );
}
