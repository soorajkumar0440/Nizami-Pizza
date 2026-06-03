import { useState, useEffect } from 'react';
import { bannersAPI, uploadAPI, adminAPI } from '../../utils/api';
import { BANNER_CATEGORIES } from '../../utils/menuCategories';
import { resolveImageUrl } from '../../utils/imageUrl';

const EMPTY = { categoryName: '', bannerImage: '', description: '', sortOrder: 0, isActive: true };

export default function BannersPanel({ showNotif }) {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [uploading, setUploading] = useState(false);

    const [heroImages, setHeroImages] = useState(['', '', '']);
    const [settings, setSettings] = useState(null);
    const [savingHero, setSavingHero] = useState(false);
    const [uploadingHero, setUploadingHero] = useState([false, false, false]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bannersRes, settingsRes] = await Promise.all([
                bannersAPI.getAll(false),
                adminAPI.getSettings()
            ]);
            setBanners(bannersRes.data);
            setSettings(settingsRes.data);
            
            const imgs = settingsRes.data.heroImages || [];
            const padded = [...imgs, '', '', ''].slice(0, 3);
            setHeroImages(padded);
        } catch {
            showNotif('Error loading data', 'error');
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
    };

    const openEdit = (banner) => {
        setEditing(banner);
        setForm({
            categoryName: banner.categoryName,
            bannerImage: banner.bannerImage,
            description: banner.description || '',
            sortOrder: banner.sortOrder || 0,
            isActive: banner.isActive !== false
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { data } = await uploadAPI.uploadImage(file);
            setForm({ ...form, bannerImage: data.url });
            showNotif('Image uploaded');
        } catch {
            showNotif('Upload failed', 'error');
        }
        setUploading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.categoryName.trim() || !form.bannerImage.trim()) {
            showNotif('Category name and image are required', 'error');
            return;
        }
        try {
            if (editing) {
                await bannersAPI.update(editing._id, form);
                showNotif('Banner updated');
            } else {
                await bannersAPI.create(form);
                showNotif('Banner created');
            }
            setEditing(null);
            setForm(EMPTY);
            loadData();
        } catch (err) {
            showNotif(err.response?.data?.message || 'Save failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category banner?')) return;
        try {
            await bannersAPI.delete(id);
            showNotif('Banner deleted');
            if (editing?._id === id) {
                setEditing(null);
                setForm(EMPTY);
            }
            loadData();
        } catch {
            showNotif('Delete failed', 'error');
        }
    };

    const handleHeroImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const newUploading = [...uploadingHero];
        newUploading[index] = true;
        setUploadingHero(newUploading);
        
        try {
            const { data } = await uploadAPI.uploadImage(file);
            const newImages = [...heroImages];
            newImages[index] = data.url;
            setHeroImages(newImages);
            showNotif(`Hero image ${index + 1} uploaded`);
        } catch {
            showNotif('Upload failed', 'error');
        }
        
        newUploading[index] = false;
        setUploadingHero(newUploading);
    };

    const handleSaveHero = async () => {
        if (!settings) return;
        setSavingHero(true);
        try {
            // Remove empty strings from the array before saving
            const validImages = heroImages.filter(url => url.trim() !== '');
            await adminAPI.updateSettings({ ...settings, heroImages: validImages });
            showNotif('Hero section updated! ✅');
            loadData();
        } catch {
            showNotif('Failed to update hero section', 'error');
        }
        setSavingHero(false);
    };

    if (loading) return <div className="loading-spinner">Loading banners...</div>;

    return (
        <div className="banners-panel">
            <div className="section-header">
                <h2>Hero Section (Homepage Slider)</h2>
                <button type="button" className="add-btn" onClick={handleSaveHero} disabled={savingHero}>
                    {savingHero ? 'Saving...' : 'Save Hero Images'}
                </button>
            </div>
            <p className="field-hint" style={{ margin: '-24px 0 24px', maxWidth: 720 }}>
                <strong>Slide 1, 2, 3</strong> teeno upload karein, phir &quot;Save Hero Images&quot;. Sirf 1 image ho to website par default slides ke sath rotate hogi.
            </p>
            
            <div className="settings-grid" style={{ marginBottom: '40px' }}>
                {[0, 1, 2].map(index => (
                    <div key={index} className="settings-card">
                        <h3>Slide {index + 1}</h3>
                        <div className="admin-form-group">
                            <label>Image URL</label>
                            <input
                                value={heroImages[index]}
                                onChange={e => {
                                    const newImages = [...heroImages];
                                    newImages[index] = e.target.value;
                                    setHeroImages(newImages);
                                }}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>Upload Image</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => handleHeroImageUpload(index, e)} 
                                disabled={uploadingHero[index]} 
                            />
                        </div>
                        {heroImages[index] && (
                            <img
                                src={resolveImageUrl(heroImages[index])}
                                alt={`Slide ${index + 1}`}
                                className="banner-preview"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="section-header">
                <h2>Category Banners (Menu tabs)</h2>
                <button type="button" className="add-btn" onClick={openCreate}>+ Add Banner</button>
            </div>

            <div className="banners-layout">
                <form className="settings-card banner-form" onSubmit={handleSave}>
                    <h3>{editing ? 'Edit Banner' : 'New Banner'}</h3>
                    <div className="admin-form-group">
                        <label>Menu category</label>
                        <select
                            value={form.categoryName}
                            onChange={e => setForm({ ...form, categoryName: e.target.value })}
                            required
                        >
                            <option value="">Select category</option>
                            {BANNER_CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <p className="field-hint">Matches menu tab: Pizza, Burger, Rolls, Chicken Broast, Club Sandwich, Drink</p>
                    </div>
                    <div className="admin-form-group">
                        <label>Banner image URL</label>
                        <input
                            value={form.bannerImage}
                            onChange={e => setForm({ ...form, bannerImage: e.target.value })}
                            placeholder="https://..."
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>Upload image</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </div>
                    {form.bannerImage && (
                        <img src={form.bannerImage} alt="Preview" className="banner-preview" />
                    )}
                    <div className="admin-form-group">
                        <label>Description (optional)</label>
                        <input
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>Sort order</label>
                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                            />
                            {' '}Active on menu
                        </label>
                    </div>
                    <div className="modal-actions" style={{ marginTop: 16 }}>
                        {editing && (
                            <button type="button" className="cancel-btn" onClick={() => { setEditing(null); setForm(EMPTY); }}>
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="save-btn" disabled={uploading}>
                            {editing ? 'Update Banner' : 'Create Banner'}
                        </button>
                    </div>
                </form>

                <div className="banners-list">
                    {banners.length === 0 ? (
                        <p className="empty-state">No banners yet. Add one for each menu category tab.</p>
                    ) : (
                        banners.map(b => (
                            <div key={b._id} className={`banner-list-item ${!b.isActive ? 'inactive' : ''}`}>
                                <img src={b.bannerImage} alt={b.categoryName} />
                                <div>
                                    <h4>{b.categoryName}</h4>
                                    <p>Order: {b.sortOrder} · {b.isActive ? 'Active' : 'Hidden'}</p>
                                    {b.description && <p className="banner-desc">{b.description}</p>}
                                </div>
                                <div className="product-actions">
                                    <button type="button" onClick={() => openEdit(b)}>Edit</button>
                                    <button type="button" className="delete" onClick={() => handleDelete(b._id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
