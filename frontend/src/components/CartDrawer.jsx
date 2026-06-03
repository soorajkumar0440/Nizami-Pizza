import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight, Truck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShopStatus } from '../context/ShopStatusContext';
import { calcOrderTotals, itemUnitPrice } from '../utils/orderTotals';
import './CartDrawer.css';

export default function CartDrawer() {
    const navigate = useNavigate();
    const {
        cartItems,
        cartCount,
        cartTotal,
        isDrawerOpen,
        closeCartDrawer,
        updateQuantity,
        removeFromCart,
        orderType,
        setOrderType,
    } = useCart();

    const { settings: siteSettings } = useShopStatus();

    const totals = useMemo(
        () => calcOrderTotals(cartTotal, siteSettings, orderType),
        [cartTotal, siteSettings, orderType]
    );

    const handleCheckout = () => {
        closeCartDrawer();
        navigate('/cart', { state: { checkout: true } });
    };

    if (!isDrawerOpen) return null;

    return (
        <div className="cart-drawer-root" role="dialog" aria-label="Shopping cart">
            <button
                type="button"
                className="cart-drawer-backdrop"
                onClick={closeCartDrawer}
                aria-label="Close cart"
            />
            <aside className="cart-drawer-panel">
                <header className="cart-drawer-header">
                    <div>
                        <h2>Your Cart</h2>
                        <p>{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                    </div>
                    <button type="button" className="cart-drawer-close" onClick={closeCartDrawer} aria-label="Close">
                        <X size={22} />
                    </button>
                </header>

                {cartItems.length > 0 && (
                    <div className="cart-drawer-order-type">
                        <button
                            type="button"
                            className={`cart-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                            onClick={() => setOrderType('delivery')}
                        >
                            <Truck size={16} />
                            Delivery
                        </button>
                        <button
                            type="button"
                            className={`cart-type-btn ${orderType === 'pickup' ? 'active' : ''}`}
                            onClick={() => setOrderType('pickup')}
                        >
                            <Store size={16} />
                            Pickup
                        </button>
                    </div>
                )}

                <div className="cart-drawer-body">
                    {cartItems.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <ShoppingBag size={48} strokeWidth={1.2} />
                            <p>Your cart is empty</p>
                            <button type="button" className="cart-drawer-ghost-btn" onClick={closeCartDrawer}>
                                Browse menu
                            </button>
                        </div>
                    ) : (
                        <ul className="cart-drawer-list">
                            {cartItems.map((item) => {
                                const unit = itemUnitPrice(item);
                                return (
                                    <li key={item.id} className="cart-drawer-item">
                                        <img
                                            src={item.img || item.image}
                                            alt={item.name || item.title}
                                            className="cart-drawer-item-img"
                                        />
                                        <div className="cart-drawer-item-info">
                                            <span className="cart-drawer-item-name">
                                                {item.name || item.title}
                                            </span>
                                            {item.size && (
                                                <span className="cart-drawer-item-size">{item.size}</span>
                                            )}
                                            <div className="cart-drawer-qty">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    aria-label="Decrease"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    aria-label="Increase"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="cart-drawer-item-right">
                                            <span className="cart-drawer-line-total">
                                                Rs. {(unit * item.quantity).toFixed(0)}
                                            </span>
                                            <button
                                                type="button"
                                                className="cart-drawer-remove"
                                                onClick={() => removeFromCart(item.id)}
                                                aria-label="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <footer className="cart-drawer-footer">
                        <div className="cart-drawer-totals">
                            <div className="cart-drawer-total-row">
                                <span>Items subtotal</span>
                                <span>Rs. {totals.subtotal.toFixed(0)}</span>
                            </div>
                            <div className="cart-drawer-total-row">
                                <span>{orderType === 'pickup' ? 'Pickup' : 'Delivery fee'}</span>
                                <span>
                                    {orderType === 'pickup'
                                        ? 'Free'
                                        : totals.deliveryFee === 0
                                          ? 'Free'
                                          : `Rs. ${totals.deliveryFee.toFixed(0)}`}
                                </span>
                            </div>
                            {orderType === 'delivery' &&
                                totals.deliveryFee > 0 &&
                                siteSettings.freeDeliveryMinimum > 0 && (
                                    <p className="cart-drawer-hint">
                                        Free delivery on orders over Rs.{' '}
                                        {siteSettings.freeDeliveryMinimum.toFixed(0)}
                                    </p>
                                )}
                            {totals.taxAmount > 0 && (
                                <div className="cart-drawer-total-row">
                                    <span>Tax ({totals.taxRate}%)</span>
                                    <span>Rs. {totals.taxAmount.toFixed(0)}</span>
                                </div>
                            )}
                            <div className="cart-drawer-total-row grand">
                                <span>Grand total</span>
                                <strong>Rs. {totals.grandTotal.toFixed(0)}</strong>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="cart-drawer-checkout-btn"
                            onClick={handleCheckout}
                        >
                            Checkout
                            <ChevronRight size={18} />
                        </button>
                        <button type="button" className="cart-drawer-continue" onClick={closeCartDrawer}>
                            Continue shopping
                        </button>
                    </footer>
                )}
            </aside>
        </div>
    );
}
