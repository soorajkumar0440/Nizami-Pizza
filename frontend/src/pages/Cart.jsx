import './Cart.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../utils/api';
import { useShopStatus } from '../context/ShopStatusContext';
import { calcOrderTotals, itemUnitPrice } from '../utils/orderTotals';
import ShopClosedBanner from '../components/ShopClosedBanner';
import {
    ArrowLeft,
    ShoppingBag,
    CheckCircle2,
    Phone,
    MapPin,
    User,
    Mail,
    Navigation,
    ArrowRight,
    Truck,
    Store,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useSiteContact } from '../utils/siteContact';

export default function Cart() {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart, openCartDrawer, orderType, setOrderType } = useCart();
    const { shopStatus, settings: siteSettings } = useShopStatus();
    const { address, mapsUrl } = useSiteContact();
    const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkout, setCheckout] = useState({
        fullName: '',
        phone: '',
        altPhone: '',
        address: '',
        landmark: '',
        email: '',
    });
    const [successData, setSuccessData] = useState({ name: '', phone: '' });

    const totals = useMemo(
        () => calcOrderTotals(cartTotal, siteSettings, orderType),
        [cartTotal, siteSettings, orderType]
    );

    const handleBackToCart = () => {
        openCartDrawer();
        navigate('/menu');
    };

    const handlePlaceOrder = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const { fullName, phone, address, landmark } = checkout;

        if (!fullName.trim()) {
            toast.error('Please enter your full name.');
            return;
        }
        if (!phone.trim()) {
            toast.error('Please enter your mobile number.');
            return;
        }
        if (orderType === 'delivery' && !address.trim()) {
            toast.error('Please enter your delivery location / address.');
            return;
        }

        if (!shopStatus.isOpen) {
            toast.error(shopStatus.message);
            return;
        }

        setIsProcessing(true);

        try {
            const orderItems = cartItems.map((item) => ({
                dealId: item.dealId || item._id || item.id,
                title: item.name || item.title,
                price:
                    typeof item.price === 'string'
                        ? parseFloat(
                              item.price.replace('Rs.', '').replace('Rs ', '').replace('$', '').trim()
                          ) || 0
                        : item.price,
                size: item.size || '',
                quantity: item.quantity,
                image: item.img || item.image,
            }));

            await ordersAPI.place({
                items: orderItems,
                totalPrice: totals.grandTotal,
                customerName: fullName.trim(),
                phone: phone.trim(),
                alternateMobile: checkout.altPhone.trim(),
                address:
                    orderType === 'pickup'
                        ? address.trim() || 'Pickup at shop'
                        : address.trim(),
                landmark: landmark.trim(),
                email: checkout.email.trim(),
                orderType,
                deliveryFee: totals.deliveryFee,
            });

            setSuccessData({ name: fullName.trim(), phone: phone.trim() });
            setIsCheckoutSuccess(true);
            clearCart();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Order failed. Please try again.');
        }
        setIsProcessing(false);
    };

    if (isCheckoutSuccess) {
        return (
            <div className="cart-page">
                <div className="container center" style={{ padding: '150px 0', textAlign: 'center' }}>
                    <div className="success-message">
                        <div className="success-icon-box" style={{ fontSize: '80px', color: '#4ade80', marginBottom: '30px' }}>
                            <CheckCircle2 size={100} />
                        </div>
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
                            Order <span className="gradient-text">Successful!</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
                            Thank you, {successData.name}! We will call you on {successData.phone} when your order is ready.
                        </p>
                        <Link to="/menu" className="btn btn-primary" style={{ padding: '15px 40px' }}>
                            Back to Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!isCheckoutSuccess && cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container center" style={{ padding: '150px 20px', textAlign: 'center' }}>
                    <ShoppingBag size={64} strokeWidth={1} style={{ opacity: 0.35, marginBottom: 20 }} />
                    <h1 style={{ marginBottom: 12 }}>Your cart is empty</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                        Add items from the menu — they appear in the cart sidebar on the right.
                    </p>
                    <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-hero">
                <div className="cart-hero-gradient"></div>
                <div className="container">
                    <h1>Checkout</h1>
                    <p>{orderType === 'pickup' ? 'Pickup order' : 'Delivery order'} — enter your details</p>
                </div>
            </div>

            <section className="cart-section">
                <div className="container">
                    {!shopStatus.isOpen && (
                        <ShopClosedBanner message={shopStatus.message} settings={siteSettings} />
                    )}

                    <div className="checkout-order-type-bar">
                        <button
                            type="button"
                            className={`checkout-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                            onClick={() => setOrderType('delivery')}
                        >
                            <Truck size={18} /> Delivery
                        </button>
                        <button
                            type="button"
                            className={`checkout-type-btn ${orderType === 'pickup' ? 'active' : ''}`}
                            onClick={() => setOrderType('pickup')}
                        >
                            <Store size={18} /> Pickup
                        </button>
                    </div>

                    <form className="checkout-layout" onSubmit={handlePlaceOrder}>
                        <div className="checkout-form-card card">
                            <div className="checkout-form-header">
                                <button type="button" className="back-to-cart-btn" onClick={handleBackToCart}>
                                    <ArrowLeft size={18} /> Back to Cart
                                </button>
                                <h2>
                                    {orderType === 'pickup' ? 'Pickup' : 'Delivery'}{' '}
                                    <span className="gradient-text">Details</span>
                                </h2>
                                <p className="checkout-form-subtitle">
                                    {orderType === 'pickup'
                                        ? 'We will notify you when your order is ready for collection.'
                                        : 'Enter your location so we can deliver hot & fresh.'}
                                </p>
                            </div>

                            {orderType === 'pickup' && (
                                <div className="pickup-shop-card">
                                    <MapPin size={18} />
                                    <div>
                                        <strong>Pickup from</strong>
                                        <p>{address}</p>
                                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                                            Open in Google Maps
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="checkout-form-fields">
                                <div className="checkout-field">
                                    <label htmlFor="checkout-name">
                                        <User size={16} /> Full Name <span className="required-star">*</span>
                                    </label>
                                    <input
                                        id="checkout-name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={checkout.fullName}
                                        onChange={(e) => setCheckout({ ...checkout, fullName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="checkout-fields-row">
                                    <div className="checkout-field">
                                        <label htmlFor="checkout-phone">
                                            <Phone size={16} /> Mobile <span className="required-star">*</span>
                                        </label>
                                        <input
                                            id="checkout-phone"
                                            type="tel"
                                            placeholder="03XX XXXXXXX"
                                            value={checkout.phone}
                                            onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="checkout-field">
                                        <label htmlFor="checkout-alt-phone">
                                            <Phone size={16} /> Alternate Mobile
                                        </label>
                                        <input
                                            id="checkout-alt-phone"
                                            type="tel"
                                            placeholder="Optional"
                                            value={checkout.altPhone}
                                            onChange={(e) => setCheckout({ ...checkout, altPhone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {orderType === 'delivery' ? (
                                    <>
                                        <div className="checkout-field">
                                            <label htmlFor="checkout-address">
                                                <MapPin size={16} /> Your Location / Address{' '}
                                                <span className="required-star">*</span>
                                            </label>
                                            <textarea
                                                id="checkout-address"
                                                placeholder="House no, street, area, landmark..."
                                                rows={3}
                                                value={checkout.address}
                                                onChange={(e) => setCheckout({ ...checkout, address: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="checkout-field">
                                            <label htmlFor="checkout-landmark">
                                                <Navigation size={16} /> Nearest Landmark
                                            </label>
                                            <input
                                                id="checkout-landmark"
                                                type="text"
                                                placeholder="e.g. Near Super Market, Masjid, Plaza..."
                                                value={checkout.landmark}
                                                onChange={(e) => setCheckout({ ...checkout, landmark: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="checkout-field">
                                        <label htmlFor="checkout-note">
                                            <MapPin size={16} /> Note (optional)
                                        </label>
                                        <input
                                            id="checkout-note"
                                            type="text"
                                            placeholder="Any pickup instructions..."
                                            value={checkout.address}
                                            onChange={(e) => setCheckout({ ...checkout, address: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="checkout-field">
                                    <label htmlFor="checkout-email">
                                        <Mail size={16} /> Email (optional)
                                    </label>
                                    <input
                                        id="checkout-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={checkout.email}
                                        onChange={(e) => setCheckout({ ...checkout, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="cart-summary">
                            <div className="summary-card card">
                                <h2>
                                    Order <span className="gradient-text">Summary</span>
                                </h2>

                                <div className="checkout-items-list">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="checkout-item-row">
                                            <div className="checkout-item-img-wrap">
                                                <img src={item.img || item.image} alt={item.name || item.title} />
                                            </div>
                                            <div className="checkout-item-info">
                                                <span className="checkout-item-name">{item.name || item.title}</span>
                                                {item.size && <span className="checkout-item-size">{item.size}</span>}
                                                <span className="checkout-item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="checkout-item-price">
                                                Rs.{' '}
                                                {(itemUnitPrice(item) * item.quantity).toFixed(0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row">
                                    <span>Items subtotal</span>
                                    <span>Rs. {totals.subtotal.toFixed(0)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>{orderType === 'pickup' ? 'Pickup' : 'Delivery fee'}</span>
                                    <span>
                                        {orderType === 'pickup'
                                            ? 'Free'
                                            : totals.deliveryFee === 0
                                              ? 'Free'
                                              : `Rs. ${totals.deliveryFee.toFixed(0)}`}
                                    </span>
                                </div>

                                {totals.taxAmount > 0 && (
                                    <div className="summary-row">
                                        <span>Tax ({totals.taxRate}%)</span>
                                        <span>Rs. {totals.taxAmount.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="summary-divider"></div>

                                <div className="summary-row total-row">
                                    <span>Grand total</span>
                                    <span className="total-price">Rs. {totals.grandTotal.toFixed(0)}</span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary checkout-btn place-order-btn"
                                    disabled={isProcessing || !shopStatus.isOpen}
                                >
                                    {isProcessing ? (
                                        <span className="btn-loading">Processing...</span>
                                    ) : shopStatus.isOpen ? (
                                        <>Place Order <ArrowRight size={18} /></>
                                    ) : (
                                        'Closed — Cannot Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}
