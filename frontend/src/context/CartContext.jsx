import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'nizami_cart';
const ORDER_TYPE_KEY = 'nizami_order_type';

function loadOrderType() {
    const saved = sessionStorage.getItem(ORDER_TYPE_KEY);
    return saved === 'pickup' ? 'pickup' : 'delivery';
}

function loadGuestCart() {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('savoré_cart');
    if (legacy) {
        localStorage.setItem(CART_STORAGE_KEY, legacy);
        localStorage.removeItem('savoré_cart');
        return JSON.parse(legacy);
    }
    return [];
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(loadGuestCart);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [orderType, setOrderTypeState] = useState(loadOrderType);

    const setOrderType = (type) => {
        const value = type === 'pickup' ? 'pickup' : 'delivery';
        setOrderTypeState(value);
        sessionStorage.setItem(ORDER_TYPE_KEY, value);
    };

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    const openCartDrawer = () => setIsDrawerOpen(true);
    const closeCartDrawer = () => setIsDrawerOpen(false);

    const addToCart = (product) => {
        const selectedSize = product.selectedSize || '';

        setCartItems(prevItems => {
            const itemId = product.id || product._id || product.dealId;
            const uniqueId = `${itemId}_${selectedSize}`;
            const existingItem = prevItems.find(item => item.id === uniqueId);
            
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === uniqueId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, id: uniqueId, dealId: itemId, size: selectedSize, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => {
        const price = typeof item.price === 'string'
            ? parseFloat(item.price.replace('Rs.', '').replace('Rs ', '').replace('$', '').trim()) || 0
            : item.price || item.rawPrice || 0;
        return acc + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isDrawerOpen,
            openCartDrawer,
            closeCartDrawer,
            orderType,
            setOrderType,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
