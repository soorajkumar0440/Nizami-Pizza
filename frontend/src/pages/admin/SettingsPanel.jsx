import { useState, useEffect, useMemo } from 'react';
import { getShopStatus } from '../../utils/shopStatus';
import { Eye, EyeOff } from 'lucide-react';
import { adminAPI, uploadAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useShopStatus } from '../../context/ShopStatusContext';

function PasswordField({ id, label, value, onChange, autoComplete }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="admin-form-group">
            <label htmlFor={id}>{label}</label>
            <div className="password-field-wrap">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    minLength={6}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    className="password-field-toggle"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

export default function SettingsPanel({ showNotif }) {
    const { user } = useAuth();
    const { refresh: refreshShopStatus } = useShopStatus();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    const [liveClock, setLiveClock] = useState(() => new Date());
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const id = setInterval(() => setLiveClock(new Date()), 30000);
        return () => clearInterval(id);
    }, []);

    const liveWebsiteStatus = useMemo(() => {
        if (!settings) return null;
        return getShopStatus(settings, liveClock);
    }, [settings, liveClock]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await adminAPI.getSettings();
            setSettings({
                ...data,
                isOpen: data.isOpen !== false,
                scheduleEnabled: data.scheduleEnabled === true,
                openingTime: (data.openingTime || '').trim(),
                closingTime: (data.closingTime || '').trim(),
            });
        } catch {
            showNotif('Error loading configuration', 'error');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...settings,
                isOpen: settings.isOpen !== false,
                scheduleEnabled: settings.scheduleEnabled === true,
            };
            const { data } = await adminAPI.updateSettings(payload);
            setSettings({
                ...data,
                isOpen: data.isOpen !== false,
                scheduleEnabled: data.scheduleEnabled === true,
                openingTime: (data.openingTime || '').trim(),
                closingTime: (data.closingTime || '').trim(),
            });
            refreshShopStatus();
            showNotif('Settings synchronized! ✅');
        } catch {
            showNotif('Failed to save settings', 'error');
        }
        setSaving(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!passwordForm.current.trim()) {
            showNotif('Enter your current password', 'error');
            return;
        }
        if (passwordForm.next.length < 6) {
            showNotif('New password must be at least 6 characters', 'error');
            return;
        }
        if (passwordForm.next !== passwordForm.confirm) {
            showNotif('New passwords do not match', 'error');
            return;
        }
        setSavingPassword(true);
        try {
            const { data } = await authAPI.updateProfile({
                name: user?.name,
                email: user?.email,
                currentPassword: passwordForm.current,
                password: passwordForm.next,
            });
            if (data.token) {
                localStorage.setItem('nizami_token', data.token);
            }
            localStorage.setItem(
                'nizami_user',
                JSON.stringify({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    isAdmin: data.role === 'admin' || data.isAdmin,
                })
            );
            showNotif('Password updated successfully');
            setPasswordForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            showNotif(err.response?.data?.message || 'Password update failed', 'error');
        }
        setSavingPassword(false);
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const { data } = await uploadAPI.uploadImage(file);
            setSettings({ ...settings, logoUrl: data.url });
            showNotif('Asset uploaded successfully');
        } catch {
            showNotif('Asset upload failed', 'error');
        }
    };

    const toggleDay = (day) => {
        const off = settings.offDays || [];
        setSettings({
            ...settings,
            offDays: off.includes(day) ? off.filter((d) => d !== day) : [...off, day],
        });
    };

    const handleClearOrders = async (olderThan) => {
        const msg = olderThan === 'all' 
            ? 'WARNING: Are you sure you want to delete ALL completed and cancelled orders?' 
            : `Are you sure you want to delete orders older than ${olderThan}?`;
        if (!window.confirm(msg)) return;
        
        try {
            const { data } = await adminAPI.clearOldOrders(olderThan);
            showNotif(data.message || 'Orders cleared successfully');
        } catch (err) {
            showNotif('Failed to clear orders', 'error');
        }
    };

    if (loading || !settings) return <div className="loading-spinner">Synchronizing settings...</div>;

    return (
        <div className="settings-panel-container">
            <div className="section-header">
                <h2>Global Configuration</h2>
                <button className="add-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Synchronizing...' : 'Save Configuration'}
                </button>
            </div>

            <div className="settings-grid">
                <div className="settings-card">
                    <h3>Branding & Identity</h3>
                    <div className="admin-form-group">
                        <label>Organization Name</label>
                        <input value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                    </div>
                    <div className="admin-form-group">
                        <label>Brand Logo Asset</label>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} />
                        {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="logo-preview" />}
                    </div>
                    <div className="admin-form-group">
                        <label>External Logo URL</label>
                        <input value={settings.logoUrl || ''} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} placeholder="https://..." />
                    </div>
                </div>

                <div className="settings-card">
                    <h3>Service & Logistics</h3>
                    <div className="admin-form-group">
                        <label>Standard Delivery Fee (Rs.)</label>
                        <input type="number" min="0" value={settings.deliveryCharges || 0} onChange={(e) => setSettings({ ...settings, deliveryCharges: Number(e.target.value) })} />
                    </div>
                    <div className="admin-form-group">
                        <label>Complimentary Delivery Threshold (Rs.)</label>
                        <input type="number" min="0" value={settings.freeDeliveryMinimum || 0} onChange={(e) => setSettings({ ...settings, freeDeliveryMinimum: Number(e.target.value) })} />
                        <p className="field-hint">Orders above this amount get free delivery. Pickup orders have no delivery fee.</p>
                    </div>
                    <div className="admin-form-group">
                        <label>Tax Rate (%)</label>
                        <input type="number" min="0" max="100" value={settings.taxRate || 0} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} />
                        <p className="field-hint">Enter 0 for &apos;Tax Included&apos;, or e.g., 5 for 5% tax.</p>
                    </div>
                </div>

                <div className="settings-card">
                    <h3>Contact Management</h3>
                    <div className="admin-form-group">
                        <label>Primary Telephone</label>
                        <input value={settings.contactPhone || ''} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} />
                    </div>
                    <div className="admin-form-group">
                        <label>Primary Email</label>
                        <input value={settings.contactEmail || ''} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
                    </div>
                    <div className="admin-form-group">
                        <label>Physical Address</label>
                        <input value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                    </div>
                </div>

                <div className="settings-card">
                    <h3>Admin Account</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                        Logged in as {user?.email}
                    </p>
                    <form onSubmit={handlePasswordChange}>
                        <PasswordField
                            id="admin-current-password"
                            label="Current Password"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            autoComplete="current-password"
                        />
                        <PasswordField
                            id="admin-new-password"
                            label="New Password"
                            value={passwordForm.next}
                            onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                            autoComplete="new-password"
                        />
                        <PasswordField
                            id="admin-confirm-password"
                            label="Confirm New Password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            autoComplete="new-password"
                        />
                        <button type="submit" className="save-btn" disabled={savingPassword} style={{ width: '100%' }}>
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                <div className="settings-card settings-card--shop-control">
                    <h3>Shop open / closed (website + navbar)</h3>
                    <p className="field-hint">
                        Yahan jo status dikhe wahi customer ko navbar par dikhega. Badalne ke baad Save Configuration dabayein.
                    </p>

                    {liveWebsiteStatus && (
                        <div
                            className={`shop-live-status ${liveWebsiteStatus.isOpen ? 'shop-live-status--open' : 'shop-live-status--closed'}`}
                            role="status"
                        >
                            <p className="shop-live-status__title">
                                Website ab: {liveWebsiteStatus.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                            </p>
                            <p className="shop-live-status__reason">{liveWebsiteStatus.reasonLabel}</p>
                            <p className="shop-live-status__time">
                                Abhi: {liveClock.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    )}

                    {liveWebsiteStatus && !liveWebsiteStatus.isOpen && (
                        <button
                            type="button"
                            className="shop-master-toggle is-open"
                            style={{ marginBottom: 12 }}
                            disabled={saving}
                            onClick={async () => {
                                const next = {
                                    ...settings,
                                    isOpen: true,
                                    scheduleEnabled: false,
                                };
                                setSettings(next);
                                setSaving(true);
                                try {
                                    const { data } = await adminAPI.updateSettings({
                                        ...next,
                                        isOpen: true,
                                        scheduleEnabled: false,
                                    });
                                    setSettings({
                                        ...data,
                                        isOpen: true,
                                        scheduleEnabled: false,
                                        openingTime: (data.openingTime || '').trim(),
                                        closingTime: (data.closingTime || '').trim(),
                                    });
                                    refreshShopStatus();
                                    showNotif('Shop khul gayi — website par OPEN dikhega ✅');
                                } catch {
                                    showNotif('Save failed', 'error');
                                }
                                setSaving(false);
                            }}
                        >
                            🟢 Shop abhi KHOLEN (save + automatic time off)
                        </button>
                    )}

                    <label className="schedule-enable-row">
                        <input
                            type="checkbox"
                            checked={settings.scheduleEnabled === true}
                            onChange={(e) =>
                                setSettings({ ...settings, scheduleEnabled: e.target.checked })
                            }
                        />
                        <span>Automatic open/close by time (opening & closing hours)</span>
                    </label>

                    {settings.scheduleEnabled === true && (
                        <div className="shop-hours-row">
                            <div className="admin-form-group">
                                <label>Opening time</label>
                                <input
                                    value={settings.openingTime || ''}
                                    onChange={(e) =>
                                        setSettings({ ...settings, openingTime: e.target.value })
                                    }
                                    placeholder="11:00 AM"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Closing time</label>
                                <input
                                    value={settings.closingTime || ''}
                                    onChange={(e) =>
                                        setSettings({ ...settings, closingTime: e.target.value })
                                    }
                                    placeholder="11:00 PM"
                                />
                                <p className="field-hint">PM likhein raat ke liye (11:00 PM)</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className={`shop-master-toggle ${settings.isOpen !== false ? 'is-closed' : 'is-open'}`}
                        onClick={() =>
                            setSettings({
                                ...settings,
                                isOpen: settings.isOpen === false,
                            })
                        }
                    >
                        {settings.isOpen !== false
                            ? '🔴 Shop manually BAND karein'
                            : '🟢 Shop manually KHOLEN'}
                    </button>

                    <div className="admin-form-group" style={{ marginTop: 16 }}>
                        <label>Off days (jin din shop band ho)</label>
                        <div className="off-days-list">
                            {days.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`day-chip ${(settings.offDays || []).includes(d) ? 'active' : ''}`}
                                    onClick={() => toggleDay(d)}
                                >
                                    {d.slice(0, 3).toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <p className="field-hint">Agar aaj ka din highlight hai to shop band dikhegi — us din ka button dubara dabayein.</p>
                    </div>
                </div>

                <div className="settings-card">
                    <h3 style={{ color: '#ef4444' }}>Data Management</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                        Delete old delivered or cancelled orders to reset stats and free up space. This action cannot be undone.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                            type="button" 
                            className="cancel-btn" 
                            onClick={() => handleClearOrders('30days')}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}
                        >
                            Delete Orders Older Than 30 Days
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn" 
                            onClick={() => handleClearOrders('1year')}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}
                        >
                            Delete Orders Older Than 1 Year
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn" 
                            onClick={() => handleClearOrders('all')}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}
                        >
                            Delete ALL Completed Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
