import { Link } from 'react-router-dom';
import './About.css';
import Footer from '../components/Footer';
import { Leaf, ChefHat, Heart, Zap, MapPin } from 'lucide-react';
import { useSiteContact } from '../utils/siteContact';

export default function About() {
    const { address, mapsUrl, siteName } = useSiteContact();
    const values = [
        { icon: Leaf, title: 'Fresh Ingredients', description: 'Quality produce in every pizza, broast, and burger.' },
        { icon: ChefHat, title: 'Expert Kitchen', description: 'Experienced team across our full menu.' },
        { icon: Heart, title: 'Customer First', description: 'Dine-in, takeaway, and delivery with care.' },
        { icon: Zap, title: 'Fast Service', description: 'Quick orders without compromising taste.' },
    ];

    const stats = [
        { number: '1000+', label: 'Happy Customers' },
        { number: '50+', label: 'Menu Items' },
        { number: '15+', label: 'Years Experience' },
        { number: '4.9★', label: 'Rating' },
    ];

    return (
        <div className="about-page">
            <section className="page-hero about-hero">
                <div className="container page-hero__inner">
                    <span className="page-eyebrow">Our Story</span>
                    <h1 className="text-grad-warm">About {siteName.split(' ')[0]}</h1>
                    <p>Liaquatabad&apos;s trusted spot for pizza, broast, burgers &amp; more — serving since 2009.</p>
                </div>
            </section>

            <section className="about-block">
                <div className="container about-intro">
                    <div className="about-intro-text">
                        <h2>Built on Taste &amp; Trust</h2>
                        <p>
                            {siteName.split(' ')[0]} started as a neighborhood burger joint with one goal: great food for our community.
                            Today we&apos;re a go-to destination for families — pizza, broast, deals, and late-night orders.
                        </p>
                        <p>
                            Every dish uses fresh ingredients and recipes refined over fifteen years. Fast food here
                            means quality, not shortcuts.
                        </p>
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="about-address-link"
                        >
                            <MapPin size={18} aria-hidden />
                            {address}
                        </a>
                    </div>
                    <div className="about-intro-visual card">
                        <div className="about-visual-item">
                            <span aria-hidden>🍕</span>
                            <strong>Pizza</strong>
                        </div>
                        <div className="about-visual-item">
                            <span aria-hidden>🍔</span>
                            <strong>Burgers</strong>
                        </div>
                        <div className="about-visual-item">
                            <span aria-hidden>🍗</span>
                            <strong>Broast</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-stats">
                <div className="container">
                    <div className="about-stats-row">
                        {stats.map((s) => (
                            <div key={s.label} className="about-stat card">
                                <span className="about-stat-num">{s.number}</span>
                                <span className="about-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="about-block about-block--alt">
                <div className="container">
                    <div className="section-title">
                        <h2 className="text-grad-warm">Our Values</h2>
                        <p className="section-subtitle">What guides every order we serve</p>
                    </div>
                    <div className="about-values">
                        {values.map((v) => {
                            const Icon = v.icon;
                            return (
                                <article key={v.title} className="about-value card">
                                    <Icon size={24} strokeWidth={1.75} aria-hidden />
                                    <h3>{v.title}</h3>
                                    <p>{v.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="about-block">
                <div className="container">
                    <div className="section-title">
                        <h2 className="text-grad-warm">Our Team</h2>
                        <p className="section-subtitle">The people behind your favorite meals</p>
                    </div>
                    <div className="about-team">
                        <article className="about-team-card card">
                            <h3>Kitchen Team</h3>
                            <p className="about-team-tag">Prep &amp; Grill</p>
                            <p>Fresh ingredients and consistent recipes, made to order.</p>
                        </article>
                        <article className="about-team-card card">
                            <h3>Pizza Station</h3>
                            <p className="about-team-tag">Hand-Stretched</p>
                            <p>Hot pizzas for dine-in and delivery across Karachi.</p>
                        </article>
                        <article className="about-team-card card">
                            <h3>Service Team</h3>
                            <p className="about-team-tag">Counter &amp; Delivery</p>
                            <p>Friendly service at our corner and reliable delivery.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="about-order-cta">
                <div className="container about-order-cta-inner">
                    <h3>Ready to order?</h3>
                    <p>Explore pizza, broast, burgers &amp; deals on our menu.</p>
                    <div className="about-order-cta-btns">
                        <Link to="/menu" className="btn btn-primary">View Menu</Link>
                        <Link to="/contact" className="btn btn-outline">Contact Us</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
