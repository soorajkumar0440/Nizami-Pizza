import './Home.css';
import './SinglePage.css';
import '../styles/ProductCards.css';
import '../styles/ProductModal.css';
import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import AnimatedHeading from '../components/AnimatedHeading';
import MenuSection from '../sections/MenuSection';
import { scrollToSection } from '../utils/scrollTo';
import {
    ShoppingBag,
    Flame,
    Clock,
    X,
    Phone,
    MapPin,
    Truck,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { adminAPI } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import WelcomePopup from '../components/WelcomePopup';
import Footer from '../components/Footer';
import deliveryImg from '../assets/images/delivery.png';
import { useSiteContact } from '../utils/siteContact';

import pizzaBannerHd from '../assets/images/pizza_banner_hd.png';
import broastBannerHd from '../assets/images/broast_banner_hd.png';
import zingerBannerHd from '../assets/images/zinger_banner_hd.png';

const DEFAULT_HERO_SLIDES = [
    { id: 'default-0', bgImg: pizzaBannerHd },
    { id: 'default-1', bgImg: broastBannerHd },
    { id: 'default-2', bgImg: zingerBannerHd },
];

function normalizeHeroImageList(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw.map((u) => String(u || '').trim()).filter(Boolean);
    }
    if (typeof raw === 'string' && raw.trim()) {
        return [raw.trim()];
    }
    return [];
}

function buildHeroSlides(heroImagesRaw) {
    const urls = normalizeHeroImageList(heroImagesRaw);
    const custom = urls.map((url, i) => ({
        id: `hero-${i}-${url.slice(-12)}`,
        bgImg: resolveImageUrl(url),
    }));

    if (custom.length >= 2) {
        return custom;
    }

    const defaults = DEFAULT_HERO_SLIDES.map((s) => ({ ...s }));

    if (custom.length === 1) {
        return [custom[0], defaults[0], defaults[1]];
    }

    return defaults;
}

export default function SinglePage() {
    const location = useLocation();
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSelectedSize, setModalSelectedSize] = useState('');
    const [siteSettings, setSiteSettings] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { addToCart } = useCart();
    const { phone, phoneTel, whatsappUrl, address, mapsUrl } = useSiteContact();

    const loadSiteSettings = () => {
        adminAPI.getSettings().then(({ data }) => setSiteSettings(data)).catch(() => {});
    };

    useEffect(() => {
        loadSiteSettings();
        const onFocus = () => loadSiteSettings();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    const heroSlides = useMemo(
        () => buildHeroSlides(siteSettings?.heroImages),
        [siteSettings?.heroImages]
    );

    const slideCount = heroSlides.length;
    const canSlide = slideCount > 1;

    useEffect(() => {
        setCurrentSlide((prev) => (prev >= slideCount ? 0 : prev));
    }, [slideCount, siteSettings?.heroImages]);

    useEffect(() => {
        if (!canSlide) return undefined;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slideCount);
        }, 5000);
        return () => clearInterval(timer);
    }, [canSlide, slideCount]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (!hash) return;
        const t = setTimeout(() => scrollToSection(hash, { focusMenuSearch: hash === 'menu' }), 150);
        return () => clearTimeout(t);
    }, [location.hash]);

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

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setModalSelectedSize(item.sizes?.length > 0 ? item.sizes[0].name : '');
        setIsModalOpen(true);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    return (
        <div className="home-professional single-page">
            <WelcomePopup settings={siteSettings} />

            <section id="home" className="boc-hero-section">
                <div className="boc-slides-container">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={`${slide.id}-${index}`}
                            className={`boc-slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            <div className="boc-slide-bg">
                                {slide.bgImg ? (
                                    <img src={slide.bgImg} alt="" className="boc-slide-bg-img" />
                                ) : (
                                    <div className="boc-slide-bg-gradient" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {canSlide && (
                    <>
                        <button
                            type="button"
                            className="boc-arrow boc-arrow-left"
                            onClick={prevSlide}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            type="button"
                            className="boc-arrow boc-arrow-right"
                            onClick={nextSlide}
                            aria-label="Next slide"
                        >
                            <ChevronRight size={28} />
                        </button>

                        <div className="boc-dots">
                            {heroSlides.map((slide, idx) => (
                                <button
                                    key={slide.id ?? idx}
                                    type="button"
                                    className={`boc-dot ${idx === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(idx)}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            <MenuSection />

            <section id="delivery" className="app-interactive-section home-delivery-section">
                <div className="container">
                    <div className="app-flex">
                        <div className="app-visual">
                            <div className="delivery-wrapper">
                                <img src={deliveryImg} alt="Delivery" className="delivery-img" />
                                <div className="app-floating-ui p1">
                                    <Flame size={20} /> Hot &amp; Fresh
                                </div>
                                <div className="app-floating-ui p2">
                                    <Clock size={20} /> 15–20 min
                                </div>
                            </div>
                        </div>
                        <div className="app-content-v2">
                            <span className="app-badge">DELIVERY &amp; PICKUP</span>
                            <AnimatedHeading
                                as="h2"
                                type="blur-in"
                                className="narrative-main-hb override-light"
                            >
                                Order for <span className="serif-italic" style={{ color: 'var(--brand-yellow, #f0b100)' }}>Delivery</span>
                            </AnimatedHeading>
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, opacity: 0.85 }}>
                                Call or WhatsApp your order — we deliver across Liaquatabad and
                                nearby. Dine-in welcome at our shop near Super Market.
                            </p>

                            <div className="delivery-contact-info">
                                <a href={phoneTel} className="contact-item">
                                    <div className="icon-circle">
                                        <Phone size={22} />
                                    </div>
                                    <div>
                                        <span>Call to order</span>
                                        <h4>{phone}</h4>
                                    </div>
                                </a>
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-item"
                                >
                                    <div className="icon-circle">
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <span>Visit us</span>
                                        <h4>{address}</h4>
                                    </div>
                                </a>
                            </div>

                            <div className="home-final-ctas">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-stone-primary"
                                >
                                    <MessageCircle size={18} />
                                    Order on WhatsApp
                                </a>
                                <button
                                    type="button"
                                    className="btn-stone-ghost"
                                    onClick={() => scrollToSection('menu')}
                                >
                                    Order from menu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

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
                                    <span className="modal-cat">
                                        {selectedItem.cat || selectedItem.category}
                                    </span>
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
                                    {selectedItem.tags && (
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
        </div>
    );
}
