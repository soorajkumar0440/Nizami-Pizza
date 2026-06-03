import { useState, useEffect } from 'react';
import { adminAPI, uploadAPI } from '../../utils/api';

export default function PopupPanel({ showNotif }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [popupEnabled, setPopupEnabled] = useState(false);
    const [popupImage, setPopupImage] = useState('');
    const [popupLink, setPopupLink] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getSettings();
            setPopupEnabled(data.popupEnabled || false);
            setPopupImage(data.popupImage || '');
            setPopupLink(data.popupLink || '');
        } catch {
            showNotif('Error loading popup settings', 'error');
        }
        setLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { data } = await uploadAPI.uploadImage(file);
            setPopupImage(data.url);
            showNotif('Image uploaded! ✅');
        } catch {
            showNotif('Upload failed', 'error');
        }
        setUploading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminAPI.updateSettings({
                popupEnabled,
                popupImage,
                popupLink,
            });
            showNotif('Popup settings saved! ✅');
        } catch {
            showNotif('Error saving popup settings', 'error');
        }
        setSaving(false);
    };

    const handleRemoveImage = () => {
        setPopupImage('');
    };

    if (loading) {
        return <div className="loading-spinner">Loading popup settings...</div>;
    }

    return (
        <div className="popup-panel">
            <div className="section-header">
                <h2>🎉 Welcome Popup</h2>
                <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '4px' }}>
                    This popup appears when customers first visit your website. Use it for promotions, offers, or announcements.
                </p>
            </div>

            {/* Enable / Disable Toggle */}
            <div className="popup-toggle-card">
                <div className="popup-toggle-info">
                    <h3>{popupEnabled ? '🟢 Popup is Active' : '🔴 Popup is Disabled'}</h3>
                    <p>{popupEnabled ? 'Customers will see this popup on their first visit.' : 'The popup is currently hidden from customers.'}</p>
                </div>
                <label className="popup-switch">
                    <input
                        type="checkbox"
                        checked={popupEnabled}
                        onChange={(e) => setPopupEnabled(e.target.checked)}
                    />
                    <span className="popup-switch-slider" />
                </label>
            </div>

            {/* Image Upload Section */}
            <div className="popup-image-section">
                <h3>Popup Image</h3>
                <div className="popup-image-area">
                    {popupImage ? (
                        <div className="popup-image-preview">
                            <img src={popupImage} alt="Popup preview" />
                            <div className="popup-image-actions">
                                <label className="popup-change-btn">
                                    {uploading ? 'Uploading...' : '📷 Change Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                </label>
                                <button
                                    type="button"
                                    className="popup-remove-btn"
                                    onClick={handleRemoveImage}
                                >
                                    🗑️ Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="popup-upload-zone">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                disabled={uploading}
                            />
                            <div className="popup-upload-content">
                                <span className="popup-upload-icon">📁</span>
                                <p>{uploading ? 'Uploading image...' : 'Click to upload popup image'}</p>
                                <span className="popup-upload-hint">Recommended: 520×700px or similar portrait ratio</span>
                            </div>
                        </label>
                    )}
                </div>

                {/* URL Input */}
                <div className="admin-form-group" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '0.75rem' }}>Or paste image URL</label>
                    <input
                        type="url"
                        value={popupImage}
                        onChange={(e) => setPopupImage(e.target.value)}
                        placeholder="https://example.com/promo-image.jpg"
                        style={{ fontSize: '0.8rem' }}
                    />
                </div>
            </div>

            {/* Link Section */}
            <div className="popup-link-section">
                <h3>Click-through Link <span style={{ opacity: 0.5, fontWeight: 400, fontSize: '0.75rem' }}>(optional)</span></h3>
                <p style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '10px' }}>
                    When a customer clicks the popup image, they will be taken to this link.
                </p>
                <div className="admin-form-group">
                    <input
                        type="url"
                        value={popupLink}
                        onChange={(e) => setPopupLink(e.target.value)}
                        placeholder="https://example.com/deals or #menu"
                        style={{ fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="popup-save-area">
                <button
                    type="button"
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : '💾 Save Popup Settings'}
                </button>
            </div>

            {/* Live Preview */}
            {popupImage && (
                <div className="popup-preview-section">
                    <h3>Preview</h3>
                    <div className="popup-preview-frame">
                        <div className="popup-preview-mock-overlay">
                            <div className="popup-preview-mock-card">
                                <div className="popup-preview-close-mock">✕</div>
                                <img src={popupImage} alt="Preview" />
                                <div className="popup-preview-bottom-mock">
                                    <div className="popup-preview-dot-mock" />
                                    <span>Nizami — Special Offer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
