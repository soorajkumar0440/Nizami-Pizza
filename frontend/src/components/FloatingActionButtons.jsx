import { useState, useEffect } from 'react';
import { Search, ArrowUp, ShoppingCart, Home, Phone, Menu as MenuIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { useSiteContact } from '../utils/siteContact';
import './FloatingActionButtons.css';

export default function FloatingActionButtons() {
    const { openCartDrawer, cartCount } = useCart();
    const [isVisible, setIsVisible] = useState(false);
    const { phoneTel } = useSiteContact();

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Show when user scrolls down
            setIsVisible(scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // init
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const focusSearch = () => {
        const searchInput = document.getElementById('menu-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Navigate to menu search
            window.location.hash = '#menu';
            setTimeout(() => {
                document.getElementById('menu-search-input')?.focus();
            }, 500);
        }
    };

    const openMobileMenu = () => {
        const hamburger = document.querySelector('.boc-hamburger');
        if (hamburger) hamburger.click();
    };

    return (
        <>
            {/* --- DESKTOP FABs (Hidden on mobile) --- */}
            {isVisible && (
                <div className="desktop-fabs">
                    {/* Search - Left Bottom */}
                    <div className="fab-wrapper fab-left-bottom">
                        <button type="button" className="fab-btn fab-primary" onClick={focusSearch} aria-label="Search">
                            <Search size={22} />
                        </button>
                    </div>

                    {/* Cart - Right, slightly up */}
                    <div className="fab-wrapper fab-right-mid">
                        <button type="button" className="fab-btn fab-cart" onClick={openCartDrawer} aria-label="Cart">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span className="fab-badge">{cartCount}</span>}
                        </button>
                    </div>

                </div>
            )}
            
            {/* --- Scroll Up FAB (Visible on both desktop & mobile) --- */}
            {isVisible && (
                <div className="fab-wrapper fab-right-bottom scroll-up-fab" style={{ zIndex: 3999 }}>
                    <button type="button" className="fab-btn fab-secondary" onClick={scrollToTop} aria-label="Scroll to top">
                        <ArrowUp size={20} />
                    </button>
                </div>
            )}

            {/* --- MOBILE BOTTOM NAV (Visible only on mobile) --- */}
            <div className="mobile-bottom-nav">
                <Link to="/" className={`mbn-item ${location.pathname === '/' && !location.hash ? 'active' : ''}`} aria-label="Home">
                    <Home size={20} />
                </Link>
                <button className="mbn-item" onClick={focusSearch} aria-label="Search">
                    <Search size={20} />
                </button>
                
                <div className="mbn-center">
                    <button className="mbn-cart-btn" onClick={openCartDrawer} aria-label="Cart">
                        <div className="mbn-cart-inner">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span className="mbn-badge">{cartCount}</span>}
                        </div>
                    </button>
                </div>
                
                <a href={phoneTel} className="mbn-item" aria-label="Call Us">
                    <Phone size={20} />
                </a>
                <button className="mbn-item" onClick={openMobileMenu} aria-label="More">
                    <MenuIcon size={22} />
                </button>
            </div>
        </>
    );
}
