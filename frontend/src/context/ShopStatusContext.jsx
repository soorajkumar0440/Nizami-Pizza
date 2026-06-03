import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { adminAPI } from '../utils/api';
import { getShopStatus } from '../utils/shopStatus';

const ShopStatusContext = createContext(null);

const DEFAULT_SETTINGS = {
    isOpen: true,
    offDays: [],
    openingTime: '',
    closingTime: '',
    scheduleEnabled: false,
    deliveryCharges: 150,
    freeDeliveryMinimum: 2000,
    taxRate: 0,
    contactPhone: '',
    contactEmail: '',
    address: '',
};

export function ShopStatusProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const { data } = await adminAPI.getSettings();
            setSettings({
                isOpen: data.isOpen !== false,
                offDays: data.offDays || [],
                openingTime: (data.openingTime || '').trim(),
                closingTime: (data.closingTime || '').trim(),
                scheduleEnabled: data.scheduleEnabled === true,
                deliveryCharges: data.deliveryCharges ?? DEFAULT_SETTINGS.deliveryCharges,
                freeDeliveryMinimum: data.freeDeliveryMinimum ?? DEFAULT_SETTINGS.freeDeliveryMinimum,
                taxRate: data.taxRate ?? DEFAULT_SETTINGS.taxRate,
                contactPhone: (data.contactPhone || '').trim(),
                contactEmail: (data.contactEmail || '').trim(),
                address: (data.address || '').trim(),
                siteName: (data.siteName || '').trim(),
                logoUrl: (data.logoUrl || '').trim(),
            });
        } catch {
            /* keep last known settings */
        } finally {
            setLoading(false);
        }
    }, []);

    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, 30000);
        return () => clearInterval(id);
    }, [refresh]);

    useEffect(() => {
        const tick = () => setNow(new Date());
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, []);

    const shopStatus = useMemo(() => getShopStatus(settings, now), [settings, now]);

    const value = useMemo(
        () => ({
            settings,
            shopStatus,
            loading,
            refresh,
        }),
        [settings, shopStatus, loading, refresh]
    );

    return <ShopStatusContext.Provider value={value}>{children}</ShopStatusContext.Provider>;
}

export function useShopStatus() {
    const ctx = useContext(ShopStatusContext);
    if (!ctx) {
        throw new Error('useShopStatus must be used within ShopStatusProvider');
    }
    return ctx;
}
