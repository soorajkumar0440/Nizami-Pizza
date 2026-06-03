import './Footer.css';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteContact } from '../utils/siteContact';
import logoImg from '../assets/images/logo.png';

export default function Footer() {
    const { openCartDrawer, cartCount } = useCart();
    const { phoneTel, whatsappUrl, logoUrl, siteName } = useSiteContact();

    return (
        <footer className="footer-v3">
            {/* Main content */}
            <div className="container footer-v3-main">
                <div className="footer-v3-grid">
                    {/* Brand Column */}
                    <div className="footer-v3-col footer-v3-brand">
                        <Link to="/" className="footer-v3-logo-link">
                            <img src={logoUrl || logoImg} alt={siteName} className="footer-v3-logo" />
                            <div className="footer-v3-logo-text">
                                <span className="footer-v3-logo-main">{siteName.split(' ')[0]}</span>
                                <span className="footer-v3-logo-sub">{siteName.substring(siteName.indexOf(' ') + 1)}</span>
                            </div>
                        </Link>
                        <p className="footer-v3-tagline">
                            Taste the perfection in every slice. We are committed to serving the best pizza in town with premium ingredients.
                        </p>
                    </div>

                    {/* Company Links */}
                    <div className="footer-v3-col">
                        <h4 className="footer-v3-heading">COMPANY</h4>
                        <ul className="footer-v3-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/deals">Hot Deals</Link></li>
                            <li>
                                <button type="button" className="footer-v3-link-btn" onClick={openCartDrawer}>
                                    My Cart {cartCount > 0 && <span className="footer-v3-cart-badge">{cartCount}</span>}
                                </button>
                            </li>
                            <li><Link to="/menu">Full Menu</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="footer-v3-col">
                        <h4 className="footer-v3-heading">SUPPORT</h4>
                        <ul className="footer-v3-links">
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/contact">Feedback</Link></li>
                            <li><Link to="/contact">Our Locations</Link></li>
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div className="footer-v3-col footer-v3-social-col">
                        <h4 className="footer-v3-heading">SOCIAL</h4>
                        <div className="footer-v3-social-icons">
                            <a href="#" aria-label="Facebook" className="footer-v3-social-btn">
                                <Facebook size={18} />
                            </a>
                            <a href="#" aria-label="Instagram" className="footer-v3-social-btn">
                                <Instagram size={18} />
                            </a>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer-v3-social-btn">
                                <MessageCircle size={18} />
                            </a>
                            <a href={phoneTel} aria-label="Phone" className="footer-v3-social-btn">
                                <Phone size={18} />
                            </a>
                        </div>
                        <p className="footer-v3-quote">
                            "Wherever your craving calls — we're already there, one perfect slice away."
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-v3-bottom">
                <div className="container footer-v3-bottom-inner">
                    <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
                    <div className="footer-v3-bottom-links">
                        <Link to="#">Privacy Policy</Link>
                        <span className="footer-v3-sep">|</span>
                        <Link to="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
