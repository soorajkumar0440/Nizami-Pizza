import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './WelcomePopup.css';

export default function WelcomePopup({ settings }) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!settings?.popupEnabled || !settings?.popupImage) return;
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
    }, [settings?.popupEnabled, settings?.popupImage]);

    const handleClose = () => {
        setVisible(false);
        setDismissed(true);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    if (!settings?.popupEnabled || !settings?.popupImage || dismissed) return null;

    const imageContent = (
        <img
            src={settings.popupImage}
            alt="Special Offer"
            className="welcome-popup-image"
        />
    );

    return createPortal(
        <div
            className={`welcome-popup-overlay ${visible ? 'visible' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="welcome-popup-container">
                <button
                    type="button"
                    className="welcome-popup-close"
                    onClick={handleClose}
                    aria-label="Close popup"
                >
                    ✕
                </button>

                {settings.popupLink ? (
                    <a
                        href={settings.popupLink}
                        className="welcome-popup-link"
                        target={settings.popupLink.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        onClick={handleClose}
                    >
                        {imageContent}
                    </a>
                ) : (
                    imageContent
                )}

                <div className="welcome-popup-bottom">
                    <div className="welcome-popup-dot" />
                    <span>Nizami — Special Offer</span>
                </div>
            </div>
        </div>,
        document.body
    );
}
