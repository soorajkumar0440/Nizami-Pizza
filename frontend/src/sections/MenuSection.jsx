import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import {
    Filter,
    Star,
    Clock,
    Flame,
    GlassWater,
    Pizza,
    UtensilsCrossed,
    X,
    ShoppingBag,
    Search,
    Sparkles,
    Gem,
    ChevronLeft,
    ChevronRight,
    Tag,
    ArrowRight,
    Plus,
} from 'lucide-react';
import {
    MENU_NAV_CATEGORIES,
    itemMatchesMenuCategory,
    isDealsSectionItem,
    findBannerForNavCategory,
} from '../utils/menuCategories';
import { resolveImageUrl } from '../utils/imageUrl';
import './MenuSection.css';
import '../styles/ProductCards.css';
import '../styles/MenuBrowse.css';
import '../styles/MenuBrowseStrip.css';
import '../styles/ProductModal.css';
import { useCart } from '../context/CartContext';
import { dealsAPI, bannersAPI, adminAPI } from '../utils/api';
import dealsBannerBg from '../assets/images/deals_banner.png';
import pizzaBannerBg from '../assets/images/pizza_banner_hd.png';
import burgerBannerBg from '../assets/images/zinger_banner_hd.png';
import rollsBannerBg from '../assets/images/rolls_banner.png';
import broastBannerBg from '../assets/images/broast_banner_hd.png';
import sandwichBannerBg from '../assets/images/sandwich_banner.png';
import drinkBannerBg from '../assets/images/drink_banner.png';

const CATEGORY_FALLBACK_BANNERS = {
    'Pizza': {
        image: pizzaBannerBg,
        desc: 'Hot, freshly-baked pizzas loaded with premium mozzarella cheese and toppings.'
    },
    'Burger': {
        image: burgerBannerBg,
        desc: 'Juicy, flame-grilled, and crispy burgers with signature house sauces.'
    },
    'Rolls': {
        image: rollsBannerBg,
        desc: 'Savor our delicious wraps and rolls stuffed with flavorful ingredients.'
    },
    'Chicken Broast': {
        image: broastBannerBg,
        desc: 'Crispy, golden-fried broast chicken served with fries and garlic dip.'
    },
    'Club Sandwich': {
        image: sandwichBannerBg,
        desc: 'Classic double-decker toasted sandwiches with chicken, lettuce, egg, and mayo.'
    },
    'Drink': {
        image: drinkBannerBg,
        desc: 'Chilled mocktails, soft drinks, and beverages to complement your meal.'
    }
};
import AnimatedHeading from '../components/AnimatedHeading';

const MenuSection = forwardRef(function MenuSection(_, ref) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [banners, setBanners] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [activeBannerNav, setActiveBannerNav] = useState('');
    const [modalSelectedSize, setModalSelectedSize] = useState('');
    const [siteSettings, setSiteSettings] = useState(null);
    const searchInputRef = useRef(null);
    const tabsScrollRef = useRef(null);
    const sectionRefs = useRef({});

    // Typing effect for placeholder
    const [placeholderText, setPlaceholderText] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const placeholderItems = useMemo(() => ['Search for Pizza...', 'Search for Burger...', 'Search for Broast...', 'Search for Deals...'], []);

    useEffect(() => {
        const item = placeholderItems[placeholderIndex];
        if (charIndex < item.length) {
            const timeout = setTimeout(() => {
                setPlaceholderText(prev => prev + item[charIndex]);
                setCharIndex(prev => prev + 1);
            }, 80);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setPlaceholderText('');
                setCharIndex(0);
                setPlaceholderIndex((prev) => (prev + 1) % placeholderItems.length);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [charIndex, placeholderIndex, placeholderItems]);

    const { addToCart } = useCart();

    useImperativeHandle(ref, () => ({
        focusSearch: () => searchInputRef.current?.focus(),
    }));

    const categoryIcons = {
        Deals: <Tag size={18} />,
        Pizza: <Pizza size={18} />,
        Burger: <Flame size={18} />,
        Rolls: <UtensilsCrossed size={18} />,
        'Club Sandwich': <Filter size={18} />,
        'Chicken Broast': <Star size={18} />,
        Drink: <GlassWater size={18} />,
    };

    const navCategories = MENU_NAV_CATEGORIES;

    useEffect(() => {
        adminAPI.getSettings().then(({ data }) => setSiteSettings(data)).catch(() => {});
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannersRes, dealsRes] = await Promise.all([
                    bannersAPI.getAll(),
                    dealsAPI.getAll(),
                ]);

                setBanners(bannersRes.data);

                const mapped = dealsRes.data
                    .filter((d) => d.isAvailable !== false)
                    .map((d) => ({
                        id: d._id,
                        _id: d._id,
                        dealId: d._id,
                        name: d.title,
                        title: d.title,
                        desc: d.description,
                        price: `Rs. ${d.price}`,
                        rawPrice: d.price,
                        cat: d.category,
                        category: d.category,
                        img: d.image,
                        image: d.image,
                        tags: d.tags || [],
                        sizes: d.sizes || [],
                        displayOn: d.displayOn || 'home',
                    }));
                setMenuItems(mapped);
                setActiveBannerNav(MENU_NAV_CATEGORIES[0].label);
            } catch {
                console.log('API unavailable for menu section');
            }
        };
        fetchData();
    }, []);



    const matchesSearch = (item, q) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q));

    const getProductsForNavCategory = (navCat) => {
        const q = searchQuery.trim().toLowerCase();
        return menuItems.filter(
            (item) => itemMatchesMenuCategory(item, navCat) && matchesSearch(item, q)
        );
    };

    const getUncategorizedProducts = () => {
        const q = searchQuery.trim().toLowerCase();
        const menuCats = MENU_NAV_CATEGORIES.filter((c) => !c.isDealsSection);
        return menuItems.filter((item) => {
            if (isDealsSectionItem(item)) return false;
            const inAny = menuCats.some((c) => itemMatchesMenuCategory(item, c));
            return !inAny && matchesSearch(item, q);
        });
    };

    const totalFiltered = searchQuery.trim()
        ? menuItems.filter(
              (m) =>
                  m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (m.desc && m.desc.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : menuItems;

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setModalSelectedSize(item.sizes?.length > 0 ? item.sizes[0].name : '');
        setIsModalOpen(true);
    };

    const handleAddToCart = (item, size) => {
        if (item.sizes?.length > 0 && !size) {
            handleViewDetails(item);
            return;
        }
        const sizeObj = size ? item.sizes.find((s) => s.name === size) : null;
        const finalPrice = sizeObj
            ? sizeObj.price
            : typeof item.price === 'string'
              ? parseFloat(item.price.replace('Rs.', '').trim())
              : item.price;
        addToCart({ ...item, price: finalPrice, selectedSize: size || '' });
    };

    const scrollToCategory = (categoryName) => {
        setActiveBannerNav(categoryName);
        const el = sectionRefs.current[categoryName];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollCatRail = (direction) => {
        tabsScrollRef.current?.scrollBy({ left: direction * 220, behavior: 'smooth' });
    };

    useEffect(() => {
        const activeBtn = tabsScrollRef.current?.querySelector('.menu-tab.active');
        activeBtn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, [activeBannerNav]);

    const categorySections = useMemo(
        () =>
            MENU_NAV_CATEGORIES.map((navCat) => ({
                key: navCat.id,
                navCat,
                categoryName: navCat.label,
                banner: findBannerForNavCategory(banners, navCat),
            })),
        [banners]
    );

    const getBannerDisplay = (navCat, banner) => {
        if (navCat.isDealsSection) {
            if (banner?.bannerImage) {
                return {
                    image: resolveImageUrl(banner.bannerImage),
                    title: 'Deals & Offers',
                    desc: banner.description || 'Browse our exceptional collection of curated food deals. Save on pizza combos, broast packs, and family deals.',
                };
            }
            return {
                image: dealsBannerBg,
                title: 'Deals & Offers',
                desc: 'Browse our exceptional collection of curated food deals. Save on pizza combos, broast packs, and family deals.',
            };
        }
        const fallback = CATEGORY_FALLBACK_BANNERS[navCat.label];
        if (banner?.bannerImage) {
            return {
                image: resolveImageUrl(banner.bannerImage),
                title: navCat.label,
                desc: banner.description || fallback?.desc || '',
            };
        }
        if (fallback) {
            return {
                image: fallback.image,
                title: navCat.label,
                desc: fallback.desc,
            };
        }
        return null;
    };

    useEffect(() => {
        if (!activeBannerNav && navCategories.length > 0) {
            setActiveBannerNav(navCategories[0].label);
        }
    }, [activeBannerNav, navCategories]);

    useEffect(() => {
        const nodes = navCategories
            .map((c) => sectionRefs.current[c.label])
            .filter(Boolean);
        if (!nodes.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting);
                if (!visible.length) return;
                const top = visible.reduce((best, cur) =>
                    cur.boundingClientRect.top < best.boundingClientRect.top ? cur : best
                );
                const cat = top.target.getAttribute('data-category');
                if (cat) setActiveBannerNav(cat);
            },
            { rootMargin: '-80px 0px -52% 0px', threshold: 0.08 }
        );

        nodes.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [menuItems.length, searchQuery]);

    const renderProductCard = (item) => {
        const hasSizes = item.sizes?.length > 0;
        const priceValue = hasSizes
            ? Math.min(...item.sizes.map((s) => s.price))
            : (typeof item.price === 'string' ? parseFloat(item.price.replace('Rs.', '').trim()) : item.price);

        // Generate a mock old price if not available, roughly 20% higher to show a discount
        const oldPrice = item.oldPrice || Math.round(priceValue * 1.25);
        const savePercent = Math.round(((oldPrice - priceValue) / oldPrice) * 100);

        return (
            <div key={item.id} className="dark-pro-card">
                <div className="dark-pro-img-box" onClick={() => handleViewDetails(item)}>
                    <img src={item.img} alt={item.name} className="img-fill" />
                    <div className="dark-pro-overlay-actions">
                        <div
                            className="dark-pro-btn-circle-alt"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                            }}
                        >
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="dark-pro-badges">
                        {item.tags?.includes('NEW') && (
                            <span className="dark-pro-badge gold">NEW</span>
                        )}
                        {hasSizes && <span className="dark-pro-badge size-badge">SIZES</span>}
                    </div>
                </div>
                <div className="dark-pro-info">
                    <h3 onClick={() => handleViewDetails(item)}>{item.name}</h3>
                    <div className="dp-price-row">
                        <div className="dp-price-col">
                            <span className="dp-new-price">
                                <span className="dp-rs">Rs.</span> {priceValue}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="dp-add-circle"
                            onClick={() => handleAddToCart(item)}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="menu" className="sp-menu-section product-collection">
            <div className="menu-browse-strip">
                <div className="menu-browse-strip-inner">
                    {navCategories.length > 0 && (
                        <div className="menu-cat-rail">
                            <button
                                type="button"
                                className="menu-cat-arrow"
                                onClick={() => scrollCatRail(-1)}
                                aria-label="Scroll categories left"
                            >
                                <ChevronLeft size={20} strokeWidth={2.5} />
                            </button>
                            <div
                                className="menu-tabs menu-cat-scroll"
                                ref={tabsScrollRef}
                                role="tablist"
                                aria-label="Menu categories"
                            >
                                {navCategories.map((navCat) => (
                                    <button
                                        key={navCat.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeBannerNav === navCat.label}
                                        className={`menu-tab ${activeBannerNav === navCat.label ? 'active' : ''}`}
                                        onClick={() => scrollToCategory(navCat.label)}
                                    >
                                        <span className="tab-icon">
                                            {categoryIcons[navCat.label] || (
                                                <UtensilsCrossed size={18} />
                                            )}
                                        </span>
                                        <span className="tab-name">{navCat.label}</span>
                                        {activeBannerNav === navCat.label && (
                                            <div className="active-tab-indicator" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="menu-cat-arrow"
                                onClick={() => scrollCatRail(1)}
                                aria-label="Scroll categories right"
                            >
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <div className="sp-menu-search-block">
                <div className="container">
                    <div className="sp-menu-search-bar">
                        <Search size={20} className="sp-search-icon" />
                        <input
                            ref={searchInputRef}
                            id="menu-search-input"
                            type="text"
                            placeholder={placeholderText || 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search menu"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="sp-search-clear"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <button type="button" className="sp-search-submit" style={{ background: 'var(--brand-yellow, #f0b100)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer', marginLeft: '8px' }}>
                            <ArrowRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="menu-products-panel">
            <div className="container sp-menu-products">
                <div className="menu-page-intro sp-menu-intro">
                    <h2 className="menu-page-title">Our Menu</h2>
                </div>

                {searchQuery.trim() && (
                    <div className="menu-search-results-info">
                        <span>
                            {totalFiltered.length} result{totalFiltered.length !== 1 ? 's' : ''} for
                            &ldquo;{searchQuery}&rdquo;
                        </span>
                    </div>
                )}

                {searchQuery.trim() ? (
                    <div className="menu-category-section search-results-section" style={{ paddingTop: '20px' }}>
                        {totalFiltered.length > 0 ? (
                            <div className="product-grid-premium" style={{ marginTop: '10px' }}>
                                {totalFiltered.map((item) => renderProductCard(item))}
                            </div>
                        ) : (
                            <div className="menu-empty-category">
                                <p>No products found for "{searchQuery}". Try a different keyword.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {categorySections.map((section) => {
                            const { categoryName, banner, key, navCat } = section;
                            const products = getProductsForNavCategory(navCat);

                            return (
                                <div
                                    key={key}
                                    id={navCat.isDealsSection ? 'deals' : undefined}
                                    className="menu-category-section"
                                    data-category={categoryName}
                                    ref={(el) => {
                                        sectionRefs.current[categoryName] = el;
                                    }}
                                >
                                    {(() => {
                                        const display = getBannerDisplay(navCat, banner);
                                        if (!display) {
                                            return (
                                                <div className="menu-category-header-simple">
                                                    <span className="mch-icon">
                                                        {categoryIcons[navCat.label] || (
                                                            <UtensilsCrossed size={24} />
                                                        )}
                                                    </span>
                                                    <div>
                                                        <h2>{categoryName}</h2>
                                                        <span className="mch-count">
                                                            {products.length}{' '}
                                                            {products.length === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="menu-category-banner">
                                                <div className="banner-image-wrapper">
                                                    <img
                                                        src={display.image}
                                                        alt={display.title}
                                                        className="banner-img"
                                                        loading="lazy"
                                                    />
                                                    <div className="banner-overlay" />
                                                    <div className="banner-content">
                                                        <h2 className="banner-title">{display.title}</h2>
                                                        <span className="banner-item-count">
                                                            {products.length}{' '}
                                                            {products.length === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {products.length > 0 ? (
                                        <div className="product-grid-premium" style={{ marginTop: '30px' }}>
                                            {products.map((item) => renderProductCard(item))}
                                        </div>
                                    ) : (
                                        <div className="menu-empty-category">
                                            <p>No products in this category yet.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {getUncategorizedProducts().length > 0 && (
                            <div
                                className="menu-category-section"
                                data-category="More Items"
                                ref={(el) => {
                                    sectionRefs.current['More Items'] = el;
                                }}
                            >
                                <div className="menu-category-header-simple">
                                    <span className="mch-icon">
                                        <UtensilsCrossed size={24} />
                                    </span>
                                    <div>
                                        <h2>More Items</h2>
                                        <span className="mch-count">
                                            {getUncategorizedProducts().length} items
                                        </span>
                                    </div>
                                </div>
                                <div className="product-grid-premium" style={{ marginTop: '30px' }}>
                                    {getUncategorizedProducts().map((item) => renderProductCard(item))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {banners.length === 0 && menuItems.length === 0 && (
                    <div className="menu-no-content">
                        <Sparkles size={48} />
                        <h3>Menu Coming Soon</h3>
                        <p>Our chefs are preparing something extraordinary. Stay tuned!</p>
                    </div>
                )}
            </div>
            </div>

            {isModalOpen &&
                selectedItem &&
                createPortal(
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div
                            className="modal-content modal-dark"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={24} />
                            </button>
                            <div className="modal-grid">
                                <div className="modal-image">
                                    <img src={selectedItem.img} alt={selectedItem.name} />
                                    <div className="modal-price-tag">
                                        {selectedItem.sizes?.length > 0
                                            ? `Rs. ${selectedItem.sizes.find((s) => s.name === modalSelectedSize)?.price || selectedItem.sizes[0].price}`
                                            : selectedItem.price}
                                    </div>
                                    <div className="modal-img-gradient" />
                                </div>
                                <div className="modal-info">
                                    <span className="modal-cat">{selectedItem.cat}</span>
                                    <h2>{selectedItem.name}</h2>
                                    <p className="modal-desc">{selectedItem.desc}</p>
                                    {selectedItem.sizes?.length > 0 && (
                                        <div className="modal-size-selector">
                                            <label>Choose Size:</label>
                                            <div className="modal-size-btns">
                                                {selectedItem.sizes.map((s) => (
                                                    <button
                                                        key={s.name}
                                                        type="button"
                                                        className={`modal-size-btn ${modalSelectedSize === s.name ? 'active' : ''}`}
                                                        onClick={() => setModalSelectedSize(s.name)}
                                                    >
                                                        <span className="msb-name">{s.name}</span>
                                                        <span className="msb-price">
                                                            Rs. {s.price}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedItem.tags?.length > 0 && (
                                        <div className="modal-tags">
                                            {selectedItem.tags.map((tag) => (
                                                <span key={tag} className="tag-pill">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="modal-features">
                                        <div className="f-item">
                                            <Clock size={16} />
                                            <span>Fast Delivery</span>
                                        </div>
                                        <div className="f-item">
                                            <Flame size={16} />
                                            <span>Freshly Prepared</span>
                                        </div>
                                    </div>
                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            className="btn-order-now"
                                            onClick={() => {
                                                handleAddToCart(
                                                    selectedItem,
                                                    modalSelectedSize || undefined
                                                );
                                                setIsModalOpen(false);
                                            }}
                                        >
                                            <ShoppingBag size={20} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </section>
    );
});

export default MenuSection;
