import { Link } from 'react-router-dom';
import './Navbar.css';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Menu, X, MapPin, Phone, ChevronDown } from 'lucide-react';
import { useSiteContact } from '../utils/siteContact';
import { useShopStatus } from '../context/ShopStatusContext';
import logoImg from '../assets/images/logo.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, openCartDrawer } = useCart();
  const { shopStatus } = useShopStatus();
  const { phone, phoneTel, address, mapsUrl, logoUrl, siteName } = useSiteContact();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Main Navbar */}
      <nav className={`boc-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="boc-navbar-inner">
          
          {/* Left: Contact Info */}
          <div className="boc-left-actions">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="boc-contact-chip"
              title={address}
            >
              <MapPin size={16} strokeWidth={2} aria-hidden />
              <span className="boc-contact-chip__text">{address}</span>
            </a>
            <a href={phoneTel} className="boc-contact-chip boc-contact-chip--phone" title={`Call ${phone}`}>
              <Phone size={16} strokeWidth={2} aria-hidden />
              <span className="boc-contact-chip__text">{phone}</span>
            </a>
          </div>

          {/* Center: Logo */}
          <div className="boc-center-logo">
            <Link to="/" className="boc-logo" onClick={closeMenu}>
              <img src={logoUrl || logoImg} alt={siteName || 'Nizami Food'} className="boc-logo-img" />
            </Link>
          </div>

          {/* Right: Shop status + Cart + Hamburger */}
          <div className="boc-right-actions">
            <span
              className={`boc-shop-status ${shopStatus.isOpen ? 'boc-shop-status--open' : 'boc-shop-status--closed'}`}
              title={shopStatus.isOpen ? 'Accepting orders' : shopStatus.message}
            >
              <span className="boc-shop-status-dot" aria-hidden />
              {shopStatus.isOpen ? 'Open' : 'Closed'}
            </span>
            <button
              type="button"
              className="boc-cart-btn"
              onClick={() => {
                openCartDrawer();
                closeMenu();
              }}
              aria-label="Open cart"
            >
              <ShoppingCart size={22} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="boc-cart-badge">{cartCount}</span>
              )}
            </button>
            <button
              className="boc-hamburger"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={26} strokeWidth={2} />
              ) : (
                <Menu size={26} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-in Drawer Menu (like Cart) */}
      {isMenuOpen && (
        <div className="boc-drawer-root">
          <button
            type="button"
            className="boc-drawer-backdrop"
            onClick={closeMenu}
            aria-label="Close menu"
          />
          <aside className="boc-drawer-panel">
            <header className="boc-drawer-header">
              <div>
                <h2>Menu</h2>
                <p>Navigate</p>
              </div>
              <button type="button" className="boc-drawer-close" onClick={closeMenu} aria-label="Close">
                <X size={22} />
              </button>
            </header>
            <div className="boc-drawer-body">
              {['Home', 'Menu', 'Deals', 'Story', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={
                    item === 'Home'
                      ? '/'
                      : item === 'Story'
                        ? '/about'
                        : `/${item.toLowerCase()}`
                  }
                  className="boc-drawer-link"
                  onClick={closeMenu}
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className={`boc-drawer-shop-status ${shopStatus.isOpen ? 'open' : 'closed'}`}>
              <span className="boc-shop-status-dot" aria-hidden />
              {shopStatus.isOpen ? 'Shop is OPEN — orders accepted' : 'Shop is CLOSED — no orders'}
            </div>
            <div className="boc-drawer-footer">
              <a href={phoneTel} className="boc-drawer-contact">
                <Phone size={16} />
                <span>{phone}</span>
              </a>
              <div className="boc-drawer-contact">
                <MapPin size={16} />
                <span>{address}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
