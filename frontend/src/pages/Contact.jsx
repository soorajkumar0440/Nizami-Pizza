import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useSiteContact } from '../utils/siteContact';

const ADMIN_LOGIN_PATH = '/ctrl-vault-9x';

export default function Contact() {
    const { phone, phoneTel, whatsappUrl, email, address, mapsUrl, siteName } = useSiteContact();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = encodeURIComponent(
            `${siteName} — New message\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || '—'}\n\n${formData.message}`
        );
        window.open(`${whatsappUrl}?text=${text}`, '_blank', 'noopener,noreferrer');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="contact-page">
            <section className="page-hero contact-hero">
                <div className="container page-hero__inner">
                    <span className="page-eyebrow">Contact</span>
                    <h1 className="text-grad-warm">Get in Touch</h1>
                    <p className="contact-hero-text">
                        Orders, feedback, or questions — call, visit, or message us on WhatsApp.
                        <Link to={ADMIN_LOGIN_PATH} className="contact-hidden-admin" aria-label="Staff">
                            .
                        </Link>
                    </p>
                </div>
            </section>

            <section className="contact-block">
                <div className="container contact-grid">
                    <div className="contact-details card">
                        <h2>Contact Details</h2>
                        <ul className="contact-detail-list">
                            <li>
                                <Phone size={20} aria-hidden />
                                <div>
                                    <span>Phone</span>
                                    <a href={phoneTel}>{phone}</a>
                                </div>
                            </li>
                            <li>
                                <Mail size={20} aria-hidden />
                                <div>
                                    <span>Email</span>
                                    <a href={`mailto:${email}`}>{email}</a>
                                </div>
                            </li>
                            <li>
                                <MapPin size={20} aria-hidden />
                                <div>
                                    <span>Address</span>
                                    <p>{address}</p>
                                </div>
                            </li>
                            <li>
                                <Clock size={20} aria-hidden />
                                <div>
                                    <span>Hours</span>
                                    <p>Mon – Sun · 11:00 AM – 1:00 AM</p>
                                </div>
                            </li>
                        </ul>
                        <div className="contact-detail-actions">
                            <a href={phoneTel} className="btn btn-primary">Call Now</a>
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                            >
                                Get Directions
                            </a>
                        </div>
                    </div>

                    <div className="contact-form-wrap card">
                        <h2>Send a Message</h2>
                        <p className="contact-form-note">Opens in WhatsApp with your details filled in.</p>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="contact-form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="03XX XXXXXXX"
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="How can we help?"
                                    rows={5}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary contact-submit">
                                <MessageCircle size={18} aria-hidden />
                                Send via WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
