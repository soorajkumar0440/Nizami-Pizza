import { useEffect, useState } from 'react';
import { useShopStatus } from '../context/ShopStatusContext';
import { useSiteContact } from '../utils/siteContact';
import logoImg from '../assets/images/logo.png';
import './LoaderSplashScreen.css';

export default function LoaderSplashScreen({ onFinish }) {
    const { loading } = useShopStatus();
    const { logoUrl } = useSiteContact();
    const [minTimePassed, setMinTimePassed] = useState(false);
    const [isHiding, setIsHiding] = useState(false);

    useEffect(() => {
        // Enforce a minimum display time of 1.5 seconds for branding
        const timer = setTimeout(() => {
            setMinTimePassed(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading && minTimePassed) {
            setIsHiding(true);
            const hideTimer = setTimeout(() => {
                onFinish();
            }, 500); // 500ms fade out transition
            return () => clearTimeout(hideTimer);
        }
    }, [loading, minTimePassed, onFinish]);

    return (
        <div className={`splash-screen ${isHiding ? 'hide' : ''}`}>
            <div className="splash-content">
                <img src={logoUrl || logoImg} alt="Loading Logo" className="splash-logo" />
                <div className="splash-loader"></div>
            </div>
        </div>
    );
}
