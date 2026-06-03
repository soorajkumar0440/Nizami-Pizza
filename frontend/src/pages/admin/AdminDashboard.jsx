import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dealsAPI, ordersAPI, uploadAPI, adminAPI } from '../../utils/api';
import OrdersPipeline from './OrdersPipeline';
import SettingsPanel from './SettingsPanel';
import BannersPanel from './BannersPanel';
import PopupPanel from './PopupPanel';
import {
    getAdminFilterCategories,
    productMatchesAdminFilter,
    PRODUCT_CATEGORIES,
    getPlacementLabel,
} from '../../utils/menuCategories';
import { useSiteContact } from '../../utils/siteContact';
import './AdminDashboard.css';

// Loud order alert (bell)
const NOTIF_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
const POLL_INTERVAL_MS = 3000;
const SOUND_REPEAT = 3;

export default function AdminDashboard() {
    const { user, isAdmin, logout, isLoading } = useAuth();
    const { logoUrl, siteName } = useSiteContact();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [deals, setDeals] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [showDealModal, setShowDealModal] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [newOrderPopup, setNewOrderPopup] = useState(false);
    const [unseenCount, setUnseenCount] = useState(0);
    const [orderSearch, setOrderSearch] = useState('');
    const [statsRange, setStatsRange] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [soundReady, setSoundReady] = useState(false);
    const audioRef = useRef(null);
    /** Last unseen count we already alerted for — only ring when API count goes above this */
    const alertedUnseenRef = useRef(null);
    const soundIntervalRef = useRef(null);
    const isPlayingAlertRef = useRef(false);
    const audioUnlockedRef = useRef(false);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        if (isLoading) return;
        if (!isAdmin) { navigate('/ctrl-vault-9x'); return; }
        const audio = new Audio(NOTIF_SOUND_URL);
        audio.volume = 1;
        audio.preload = 'auto';
        audioRef.current = audio;

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }

        const unlock = () => {
            audioUnlockedRef.current = true;
            setSoundReady(true);
            if (!audioRef.current) return;
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }).catch(() => {});
        };
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });

        loadData();

        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
        };
    }, [isAdmin, navigate, isLoading]);

    const playSound = useCallback(() => {
        if (isPlayingAlertRef.current) return;
        try {
            isPlayingAlertRef.current = true;
            const playOnce = () => {
                if (!audioRef.current) return;
                const clip = audioRef.current;
                clip.volume = 1;
                clip.currentTime = 0;
                clip.play().catch(() => {});
            };
            playOnce();
            if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
            let n = 1;
            soundIntervalRef.current = setInterval(() => {
                if (n >= SOUND_REPEAT) {
                    clearInterval(soundIntervalRef.current);
                    soundIntervalRef.current = null;
                    isPlayingAlertRef.current = false;
                    return;
                }
                playOnce();
                n += 1;
            }, 900);
        } catch {
            isPlayingAlertRef.current = false;
        }
    }, []);

    /** Debounce guard — prevent multiple rapid alerts within 5s */
    const lastAlertTimeRef = useRef(0);

    const alertNewOrders = useCallback((newOrderCount) => {
        const now = Date.now();
        if (now - lastAlertTimeRef.current < 5000) return; // debounce 5s
        lastAlertTimeRef.current = now;

        setNewOrderPopup(true);
        setTimeout(() => setNewOrderPopup(false), 8000);

        const canAlert =
            audioUnlockedRef.current &&
            document.visibilityState === 'visible' &&
            isAdmin;

        if (canAlert) {
            playSound();
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification(`${siteName} — New order!`, {
                        body:
                            newOrderCount > 1
                                ? `${newOrderCount} new orders just came in`
                                : 'A new order just came in',
                        icon: logoUrl || '/logo.png',
                        tag: 'nizami-new-order',
                    });
                } catch {}
            }
        }
        loadData();
    }, [playSound, isAdmin, siteName, logoUrl]);

    // Fast poll for new orders (dashboard only — this page is not mounted elsewhere)
    useEffect(() => {
        if (!isAdmin) return;

        const poll = async () => {
            if (document.visibilityState !== 'visible') return;
            try {
                const { data } = await adminAPI.getUnseenCount();
                const count = data.count ?? 0;
                const baseline = alertedUnseenRef.current;

                if (baseline === null) {
                    alertedUnseenRef.current = count;
                } else if (count > baseline) {
                    alertNewOrders(count - baseline);
                    alertedUnseenRef.current = count;
                } else if (count < baseline) {
                    alertedUnseenRef.current = count;
                }

                setUnseenCount(count);
            } catch {}
        };

        poll();
        const interval = setInterval(poll, POLL_INTERVAL_MS);

        const onVisible = () => {
            if (document.visibilityState === 'visible') poll();
        };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [isAdmin, alertNewOrders]);

    const loadData = async (range = statsRange) => {
        setLoading(true);
        try {
            const [dealsRes, ordersRes, statsRes] = await Promise.all([
                dealsAPI.getAll(), ordersAPI.getAllOrders(), adminAPI.getStats(range)
            ]);
            setDeals(dealsRes.data);
            setOrders(ordersRes.data);
            setStats(statsRes.data);
            // NOTE: unseenCount is managed exclusively by the polling effect
            // to avoid race conditions with alertedUnseenRef
        } catch {
            showNotif('Error loading data', 'error');
        }
        setLoading(false);
    };

    const loadUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers();
            setUsers(data);
        } catch { showNotif('Error loading users', 'error'); }
    };

    useEffect(() => {
        loadData(statsRange);
    }, [statsRange]);

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'notifications') {
            adminAPI.markOrdersSeen().catch(() => {});
            alertedUnseenRef.current = 0;
            setUnseenCount(0);
        }
    }, [activeTab]);

    const showNotif = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const handleLogout = () => { logout(); navigate('/'); };

    const handleSaveDeal = async (dealData) => {
        try {
            if (editingDeal) { await dealsAPI.update(editingDeal._id, dealData); showNotif('Deal updated! ✅'); }
            else { await dealsAPI.create(dealData); showNotif('Deal added! 🎉'); }
            loadData(); setShowDealModal(false); setEditingDeal(null);
        } catch (e) { showNotif(e.response?.data?.message || 'Error saving deal', 'error'); }
    };

    const handleDeleteDeal = async (id) => {
        if (window.confirm('Delete this deal?')) {
            try { await dealsAPI.delete(id); showNotif('Deal deleted!'); loadData(); }
            catch { showNotif('Error deleting deal', 'error'); }
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await ordersAPI.updateStatus(orderId, status);
            showNotif(`Order → ${status}`);
            loadData();
        } catch { showNotif('Error updating order', 'error'); }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Delete this user?')) {
            try { await adminAPI.deleteUser(userId); showNotif('User deleted!'); loadUsers(); loadData(); }
            catch (e) { showNotif(e.response?.data?.message || 'Error', 'error'); }
        }
    };

    const handleDeleteOrderNotification = async (orderId) => {
        if (!window.confirm('Delete this order notification? The order will be removed permanently.')) return;
        try {
            await ordersAPI.deleteOrder(orderId);
            showNotif('Order deleted');
            loadData();
        } catch (e) {
            showNotif(e.response?.data?.message || 'Could not delete order', 'error');
        }
    };

    const allCategories = getAdminFilterCategories();
    const filteredDeals = deals.filter((d) => productMatchesAdminFilter(d, categoryFilter));
    const notificationOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const recentNotifications = notificationOrders.map((o) => ({
        id: o._id,
        icon: o.status === 'new' ? '🔔' : o.status === 'delivered' ? '✅' : o.status === 'cancelled' ? '❌' : o.status === 'cooking' ? '🔥' : '📋',
        text: `${o.customerName || 'Guest'} — Rs. ${o.totalPrice?.toFixed(0)} (${o.status})`,
        time: new Date(o.createdAt).toLocaleString(),
        unread: o.status === 'new' && !o.seen,
    }));

    const newOrdersCount = orders.filter(o => o.status === 'new').length;

    const tabs = [
        { id: 'home', label: 'Dashboard', shortLabel: 'Home', icon: '🏠' },
        { id: 'orders', label: 'Orders', shortLabel: 'Orders', icon: '📦', badge: newOrdersCount },
        { id: 'deals', label: 'Products', shortLabel: 'Menu', icon: '🍔' },
        { id: 'banners', label: 'Banners', shortLabel: 'Banners', icon: '🖼️' },
        { id: 'popup', label: 'Popup', shortLabel: 'Popup', icon: '🎉' },
        { id: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: '🔔', badge: unseenCount },
        { id: 'users', label: 'Users', shortLabel: 'Users', icon: '👥' },
        { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: '⚙️' },
    ];

    const bottomNavTabs = tabs.filter(t => ['home', 'orders', 'deals', 'notifications'].includes(t.id));
    const activeTabMeta = tabs.find(t => t.id === activeTab);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const filteredOrders = orderSearch.trim()
        ? orders.filter(o => {
            const q = orderSearch.toLowerCase();
            return (
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.customerPhone || '').toLowerCase().includes(q) ||
                (o.address || '').toLowerCase().includes(q) ||
                o._id.toLowerCase().includes(q)
            );
        })
        : orders;

    return (
        <div className={`admin-dashboard${mobileMenuOpen ? ' menu-open' : ''}`}>
            {notification && <div className={`admin-notification ${notification.type}`}>{notification.message}</div>}
            {newOrderPopup && <div className="new-order-popup">🔔 New Order Received! <div className="sound-indicator"><div className="sound-bar"/><div className="sound-bar"/><div className="sound-bar"/></div></div>}
            {!soundReady && (
                <div className="admin-sound-hint" role="status">
                    Tap anywhere on the dashboard to enable full-volume order alerts.
                </div>
            )}

            <header className="admin-mobile-header">
                <button
                    type="button"
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(v => !v)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileMenuOpen}
                >
                    <span className="menu-icon-bar" />
                    <span className="menu-icon-bar" />
                    <span className="menu-icon-bar" />
                </button>
                <div className="mobile-header-title">
                    <span className="mobile-header-icon">{activeTabMeta?.icon}</span>
                    <div>
                        <strong>{activeTabMeta?.label || 'Dashboard'}</strong>
                        <small>{siteName.split(' ')[0]} Admin</small>
                    </div>
                </div>
                {newOrdersCount > 0 && activeTab !== 'orders' && (
                    <button type="button" className="mobile-header-badge" onClick={() => handleTabChange('orders')}>
                        {newOrdersCount}
                    </button>
                )}
            </header>

            <button
                type="button"
                className="sidebar-backdrop"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
            />

            <aside className={`admin-sidebar${mobileMenuOpen ? ' open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logoUrl || '/logo.png'} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ marginLeft: '10px' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{siteName.split(' ')[0]}<span>.</span></h2>
                        <p style={{ fontSize: '0.65rem', margin: 0 }}>ADMINISTRATION</p>
                    </div>
                    <button type="button" className="sidebar-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close">✕</button>
                </div>
                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <button key={tab.id} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => handleTabChange(tab.id)}>
                            <span className="nav-icon">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                            {tab.badge > 0 && <span className="nav-badge">{tab.badge}</span>}
                        </button>
                    ))}
                    <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
                </nav>
            </aside>

            <nav className="admin-bottom-nav" aria-label="Main navigation">
                {bottomNavTabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <span className="bottom-nav-icon">{tab.icon}</span>
                        <span className="bottom-nav-label">{tab.shortLabel}</span>
                        {tab.badge > 0 && <span className="bottom-nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>}
                    </button>
                ))}
                <button
                    type="button"
                    className={`bottom-nav-item more-nav ${['banners', 'popup', 'users', 'settings'].includes(activeTab) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <span className="bottom-nav-icon">☰</span>
                    <span className="bottom-nav-label">More</span>
                </button>
            </nav>

            <main className="admin-main">
                <div className="admin-top-bar">
                    <h1>{activeTabMeta?.label || 'Dashboard'} <span>MANAGEMENT SYSTEM</span></h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {activeTab === 'home' && (
                            <select 
                                className="stats-range-select" 
                                value={statsRange} 
                                onChange={(e) => setStatsRange(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="all" style={{color: '#000'}}>All Time</option>
                                <option value="today" style={{color: '#000'}}>Today</option>
                                <option value="month" style={{color: '#000'}}>This Month</option>
                                <option value="year" style={{color: '#000'}}>This Year</option>
                            </select>
                        )}
                        <span className="admin-date">{today}</span>
                    </div>
                </div>

                {activeTab === 'home' && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-info">
                                <p>Total Inventory</p>
                                <h3>{deals.length}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-info">
                                <p>Total Orders</p>
                                <h3>{stats?.totalOrders || 0}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-info">
                                <p>Net Revenue</p>
                                <h3>Rs. {(stats?.totalRevenue || 0).toFixed(0)}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-info">
                                <p>Active Orders</p>
                                <h3 style={{color: '#ef4444'}}>
                                    {(stats?.newOrders || 0) + (stats?.acceptedOrders || 0) + (stats?.cookingOrders || 0)}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {loading && <div className="loading-spinner">Loading...</div>}

                {activeTab === 'home' && !loading && (
                    <div className="dashboard-grid">
                        <div className="dash-card">
                            <h3>📦 Recent Orders</h3>
                            {(stats?.recentOrders || orders.slice(0,5)).map(o => (
                                <div key={o._id} className="recent-order-item">
                                    <div className="ro-info">
                                        <h4>{o.customerName||'Guest'} <span className={`status-badge ${o.status}`}>{o.status}</span></h4>
                                        <p>{o.items?.length||0} items · {new Date(o.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="ro-price">Rs. {o.totalPrice?.toFixed(0)}</span>
                                </div>
                            ))}
                            {orders.length === 0 && <p className="empty-state">No orders yet</p>}
                        </div>
                        <div className="dash-card">
                            <h3>📊 Category Breakdown</h3>
                            <div className="category-bar-list">
                                {(stats?.categoryBreakdown||[]).map(cat => (
                                    <div key={cat._id} className="category-bar-item">
                                        <div className="cb-header"><span className="cb-name">{cat._id}</span><span className="cb-count">{cat.count} items</span></div>
                                        <div className="category-bar-track"><div className="category-bar-fill" style={{width:`${(cat.count/deals.length)*100}%`}}/></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && !loading && (
                    <>
                        <div className="admin-search-bar">
                            <input
                                type="search"
                                placeholder="Search orders by name, phone, address, or ID..."
                                value={orderSearch}
                                onChange={e => setOrderSearch(e.target.value)}
                            />
                            {orderSearch && (
                                <button type="button" className="cancel-btn" onClick={() => setOrderSearch('')}>Clear</button>
                            )}
                        </div>
                        <OrdersPipeline orders={filteredOrders} onUpdateStatus={handleUpdateOrderStatus} />
                    </>
                )}

                {activeTab === 'banners' && <BannersPanel showNotif={showNotif} />}

                {activeTab === 'popup' && <PopupPanel showNotif={showNotif} />}

                {activeTab === 'deals' && !loading && (
                    <div className="products-section">
                        <div className="section-header">
                            <h2>🍔 Products & Deals</h2>
                            <button className="add-btn" onClick={() => { setEditingDeal(null); setShowDealModal(true); }}>+ Add Product</button>
                        </div>
                        <div className="filter-bar">
                            {allCategories.map(cat => (
                                <button key={cat} className={`filter-chip ${categoryFilter===cat?'active':''}`} onClick={() => setCategoryFilter(cat)}>
                                    {cat} {cat!=='All' && `(${deals.filter(d=>productMatchesAdminFilter(d,cat)).length})`}
                                </button>
                            ))}
                        </div>
                        <div className="products-grid">
                            {filteredDeals.map(deal => (
                                <div key={deal._id} className={`product-card-admin ${deal.isAvailable === false ? 'unavailable' : ''}`}>
                                    <img src={deal.image||'https://via.placeholder.com/300x150?text=No+Image'} alt={deal.title} />
                                    <div className="product-info">
                                        <h3>{deal.title} {deal.isAvailable === false && <span className="stock-badge">Out of stock</span>}</h3>
                                        <p className="category">
                                            {deal.category}
                                            <span className="placement-badge">{getPlacementLabel(deal.displayOn)}</span>
                                        </p>
                                        {deal.sizes && deal.sizes.length > 0 ? (
                                            <div className="admin-sizes-display">
                                                {deal.sizes.map((s, i) => (
                                                    <span key={i} className="admin-size-chip">{s.name}: Rs.{s.price}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="price">Rs. {deal.price}</p>
                                        )}
                                    </div>
                                    <div className="product-actions">
                                        <button onClick={() => { setEditingDeal(deal); setShowDealModal(true); }}>✏️ Edit</button>
                                        <button className="delete" onClick={() => handleDeleteDeal(deal._id)}>🗑️ Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredDeals.length === 0 && <p className="empty-state">No products in this category</p>}
                    </div>
                )}

                {activeTab === 'notifications' && !loading && (
                    <div className="notifications-section">
                        <div className="section-header">
                            <h2>🔔 Notifications ({recentNotifications.length})</h2>
                            {recentNotifications.length > 0 && (
                                <button
                                    type="button"
                                    className="cancel-btn notifications-mark-read"
                                    onClick={() => {
                                        adminAPI.markOrdersSeen().then(() => {
                                            showNotif('All marked as read');
                                            loadData();
                                        }).catch(() => showNotif('Error', 'error'));
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        {recentNotifications.length === 0 ? (
                            <p className="empty-state">No notifications</p>
                        ) : (
                            <div className="notifications-list">
                                {recentNotifications.map((n) => (
                                    <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                                        <div className="notif-icon">{n.icon}</div>
                                        <div className="notif-content">
                                            <p>{n.text}</p>
                                            <span className="notif-time">{n.time}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="notification-delete-btn"
                                            onClick={() => handleDeleteOrderNotification(n.id)}
                                            title="Delete order"
                                            aria-label="Delete notification"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && !loading && (
                    <div>
                        <div className="section-header"><h2>👥 Customers</h2></div>
                        {users.length === 0 ? <p className="empty-state">No users yet</p> : (
                            <div className="users-table"><table>
                                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr></thead>
                                <tbody>{users.map(u => (
                                    <tr key={u._id}>
                                        <td data-label="Name">{u.name}</td>
                                        <td data-label="Email">{u.email}</td>
                                        <td data-label="Role"><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td data-label="Orders">{u.totalOrders || 0}</td>
                                        <td data-label="Total Spent" className="user-spent-cell">Rs. {(u.totalSpent||0).toFixed(0)}</td>
                                        <td data-label="Joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td data-label="Actions">{u.role !== 'admin' && <button className="delete-user-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button>}</td>
                                    </tr>
                                ))}</tbody>
                            </table></div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && <SettingsPanel showNotif={showNotif} />}
            </main>

            {showDealModal && <DealModal deal={editingDeal} onSave={handleSaveDeal} onClose={() => { setShowDealModal(false); setEditingDeal(null); }} />}
        </div>
    );
}

function DealModal({ deal, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: deal?.title||'', description: deal?.description||'', price: deal?.price||'',
        category: deal?.category || 'Deal',
        image: deal?.image || '',
        tags: deal?.tags?.join(', ') || '',
        displayOn: deal?.displayOn || 'home',
        isAvailable: deal?.isAvailable !== false
    });
    const [hasSizes, setHasSizes] = useState(deal?.sizes?.length > 0 || false);
    const [sizes, setSizes] = useState(
        deal?.sizes?.length > 0 ? deal.sizes.map(s => ({ name: s.name, price: s.price })) : [{ name: 'Small', price: '' }, { name: 'Medium', price: '' }, { name: 'Large', price: '' }]
    );
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(deal?.image||'');
    const categories = PRODUCT_CATEGORIES;

    const handleCategoryChange = (category) => {
        const selectedCat = PRODUCT_CATEGORIES.find(c => c.value === category);
        const newDisplayOn = selectedCat?.isDealsCategory ? 'deals' : 'home';
        setFormData({ ...formData, category, displayOn: newDisplayOn });
        if (category === 'Pizza') {
            setHasSizes(true);
            if (!deal?.sizes?.length) {
                setSizes([{ name: 'Small', price: '' }, { name: 'Medium', price: '' }, { name: 'Large', price: '' }]);
            }
        } else if (!deal?.sizes?.length) {
            setHasSizes(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setUploading(true);
        try { const { data } = await uploadAPI.uploadImage(file); setFormData({...formData,image:data.url}); setImagePreview(data.url); }
        catch { alert('Upload failed.'); }
        setUploading(false);
    };

    const handleSizeChange = (index, field, value) => {
        const updated = [...sizes];
        updated[index][field] = value;
        setSizes(updated);
    };

    const addSizeRow = () => {
        setSizes([...sizes, { name: '', price: '' }]);
    };

    const removeSizeRow = (index) => {
        if (sizes.length <= 1) return;
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validSizes = hasSizes ? sizes.filter(s => s.name && s.price).map(s => ({ name: s.name, price: parseFloat(s.price) })) : [];
        const basePrice = hasSizes && validSizes.length > 0 ? Math.min(...validSizes.map(s => s.price)) : parseFloat(formData.price);
        onSave({ 
            ...formData, 
            price: basePrice, 
            tags: formData.tags.split(',').map(t=>t.trim()).filter(t=>t), 
            sizes: validSizes,
            displayOn: formData.displayOn,
            isAvailable: formData.isAvailable
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content deal-modal-content" onClick={e=>e.stopPropagation()}>
                <button type="button" className="modal-close-btn" onClick={onClose} title="Close" aria-label="Close">✕</button>

                <div className="modal-inner-scroll">
                    <h2>{deal ? 'Edit Selection' : 'Create New Product'}</h2>
                    <form onSubmit={handleSubmit} className="modal-form-grid">
                    <div className="form-column">
                        <div className="admin-form-group">
                            <label>Product Title</label>
                            <input type="text" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required placeholder="e.g. Signature Beef Burger" />
                        </div>
                        
                        <div className="admin-form-group">
                            <label>Description</label>
                            <textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} required placeholder="Describe the ingredients and flavor profile..." />
                        </div>

                        {hasSizes ? (
                            <div className="sizes-section">
                                <label>Size Variants & Prices</label>
                                <div className="sizes-list">
                                    {sizes.map((size, i) => (
                                        <div key={i} className="size-row">
                                            <input type="text" value={size.name} onChange={e => handleSizeChange(i, 'name', e.target.value)} placeholder="Size name (e.g. Medium)" className="size-name-input" />
                                            <input type="number" step="1" value={size.price} onChange={e => handleSizeChange(i, 'price', e.target.value)} placeholder="Price (Rs.)" className="size-price-input" />
                                            <button type="button" className="size-remove-btn" onClick={() => removeSizeRow(i)} title="Remove">✕</button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="size-add-btn" onClick={addSizeRow}>+ Add Size</button>
                            </div>
                        ) : (
                            <div className="admin-form-group">
                                <label>Price (PKR)</label>
                                <input type="number" value={formData.price} onChange={e=>setFormData({...formData,price:e.target.value})} required placeholder="0.00" />
                            </div>
                        )}

                        <div className="admin-form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={e=>handleCategoryChange(e.target.value)}>
                                    {categories.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                                {formData.category === 'Deal' && (
                                    <p className="field-hint">Deal products automatically appear in the Deals section on the website.</p>
                                )}
                            </div>

                        <div className="admin-form-group">
                            <label>Product Tags</label>
                            <input value={formData.tags} onChange={e=>setFormData({...formData,tags:e.target.value})} placeholder="BESTSELLER, SPICY" />
                        </div>

                        <div className="admin-form-group">
                            <label>
                                <input type="checkbox" checked={hasSizes} onChange={e => setHasSizes(e.target.checked)} />
                                {' '}Use size variants (prices per size)
                            </label>
                        </div>

                        <div className="admin-form-group">
                            <label>
                                <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })} />
                                {' '}Available for customers to order
                            </label>
                        </div>
                    </div>

                    <div className="image-preview-column">
                        <label>Product Image</label>
                        <div className="image-preview-wrapper">
                            {imagePreview ? <img src={imagePreview} alt="Preview" /> : <div className="no-image">No Image Selected</div>}
                        </div>
                        
                        <div className="admin-form-group">
                            <label style={{fontSize: '0.6rem', marginTop: '10px'}}>Upload Asset</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize: '0.7rem', padding: '8px'}} />
                            {uploading && <p className="upload-status">Processing asset...</p>}
                        </div>

                        <div className="admin-form-group">
                            <label style={{fontSize: '0.6rem'}}>Remote URL</label>
                            <input type="url" value={formData.image} onChange={e=>{setFormData({...formData,image:e.target.value});setImagePreview(e.target.value);}} placeholder="https://..." style={{fontSize: '0.7rem', padding: '8px'}} />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Discard Changes</button>
                        <button type="submit" className="save-btn" disabled={uploading}>{uploading ? 'Processing...' : (deal ? 'Update Asset' : 'Register Product')}</button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}

