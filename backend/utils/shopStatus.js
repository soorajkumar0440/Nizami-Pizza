const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseTimeToMinutes(timeStr, opts = {}) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const trimmed = timeStr.trim();
    if (!trimmed) return null;

    const withPeriod = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (withPeriod) {
        let hour = parseInt(withPeriod[1], 10);
        const minute = withPeriod[2] ? parseInt(withPeriod[2], 10) : 0;
        const period = withPeriod[3].toUpperCase();
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
        if (period === 'AM') {
            if (hour === 12) hour = 0;
        } else if (hour !== 12) {
            hour += 12;
        }
        return hour * 60 + minute;
    }

    const colon = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (colon) {
        let hour = parseInt(colon[1], 10);
        const minute = parseInt(colon[2], 10);
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
        if (hour > 12) return hour * 60 + minute;
        if (hour === 12) return 12 * 60 + minute;
        if (opts.preferPm && hour >= 1 && hour <= 11) {
            hour += 12;
        }
        return hour * 60 + minute;
    }

    return null;
}

function isWithinOperatingHours(openingTime, closingTime, date = new Date()) {
    const openMin = parseTimeToMinutes(openingTime);
    const closeMin = parseTimeToMinutes(closingTime, { preferPm: true });
    if (openMin == null || closeMin == null) return true;
    if (openMin === closeMin) return true;

    const nowMin = date.getHours() * 60 + date.getMinutes();

    if (closeMin > openMin) {
        return nowMin >= openMin && nowMin < closeMin;
    }
    return nowMin >= openMin || nowMin < closeMin;
}

function normalizeShopSettings(raw) {
    if (!raw) {
        return {
            isOpen: true,
            offDays: [],
            openingTime: '',
            closingTime: '',
            scheduleEnabled: false,
        };
    }
    const openingTime = String(raw.openingTime || '').trim();
    const closingTime = String(raw.closingTime || '').trim();
    const hasValidHours =
        parseTimeToMinutes(openingTime) != null &&
        parseTimeToMinutes(closingTime, { preferPm: true }) != null;

    return {
        isOpen: raw.isOpen !== false,
        offDays: raw.offDays || [],
        openingTime,
        closingTime,
        scheduleEnabled: raw.scheduleEnabled === true && hasValidHours,
    };
}

function getShopStatus(settings) {
    const s = normalizeShopSettings(settings);
    const now = new Date();

    if (s.isOpen === false) {
        return {
            isOpen: false,
            message: 'Shop is closed. Orders are not accepted at the moment.',
        };
    }

    const today = DAY_NAMES[now.getDay()];
    if (s.offDays.includes(today)) {
        return {
            isOpen: false,
            message: `We are closed today (${today}). Orders are not accepted.`,
        };
    }

    if (s.scheduleEnabled && !isWithinOperatingHours(s.openingTime, s.closingTime, now)) {
        return {
            isOpen: false,
            message: `We are closed. Open hours: ${s.openingTime} – ${s.closingTime}.`,
        };
    }

    return { isOpen: true, message: '' };
}

function getShopClosedMessage(settings) {
    const status = getShopStatus(settings);
    return status.message || 'We are currently closed. Please try again during business hours.';
}

function isShopOpen(settings) {
    return getShopStatus(settings).isOpen;
}

module.exports = {
    isShopOpen,
    getShopClosedMessage,
    getShopStatus,
    parseTimeToMinutes,
    isWithinOperatingHours,
    normalizeShopSettings,
};
