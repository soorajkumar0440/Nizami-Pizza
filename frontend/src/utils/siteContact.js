import { useShopStatus } from '../context/ShopStatusContext';

// ── Fallback defaults (used when context isn't ready yet or outside provider) ──
export const FALLBACK_PHONE     = '03100003635';
export const FALLBACK_EMAIL     = 'orders@nizamifood.com';
export const FALLBACK_ADDRESS   = 'Liaquatabad No 2 Near super market';

// ── Static constants kept for backward-compat (imports that can't use hooks) ──
export const SITE_PHONE         = FALLBACK_PHONE;
export const SITE_PHONE_TEL     = `tel:${FALLBACK_PHONE}`;
export const SITE_WHATSAPP_URL  = `https://wa.me/92${FALLBACK_PHONE.replace(/^0/, '')}`;
export const SITE_ADDRESS       = FALLBACK_ADDRESS;
export const SITE_MAPS_URL      = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FALLBACK_ADDRESS)}`;

// ── Helper: build derived values from a raw phone / address ──
function deriveContact(phone, email, address) {
    const p = phone || FALLBACK_PHONE;
    const e = email || FALLBACK_EMAIL;
    const a = address || FALLBACK_ADDRESS;

    return {
        phone: p,
        phoneTel: `tel:${p}`,
        whatsappUrl: `https://wa.me/92${p.replace(/^0/, '')}`,
        email: e,
        address: a,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`,
    };
}

function deriveBranding(siteName, logoUrl) {
    return {
        siteName: siteName || 'Nizami Food & Pizza Corner',
        logoUrl: logoUrl || ''
    };
}

/**
 * React hook — returns dynamic contact info sourced from admin settings.
 * Falls back to hardcoded defaults while settings haven't loaded yet.
 *
 * Usage:
 *   const { phone, phoneTel, whatsappUrl, email, address, mapsUrl } = useSiteContact();
 */
export function useSiteContact() {
    const { settings } = useShopStatus();
    return {
        ...deriveContact(settings?.contactPhone, settings?.contactEmail, settings?.address),
        ...deriveBranding(settings?.siteName, settings?.logoUrl)
    };
}
