const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * @param {string} timeStr
 * @param {{ preferPm?: boolean }} opts — closing times without AM/PM default to PM (e.g. 11:00 → 11 PM)
 * @returns {number|null} minutes from midnight (0–1439)
 */
export function parseTimeToMinutes(timeStr, opts = {}) {
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

export function isWithinOperatingHours(openingTime, closingTime, date = new Date()) {
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

/** Normalize API / form values for status checks */
export function normalizeShopSettings(raw) {
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

export function getShopStatus(settings, now = new Date()) {
    const s = normalizeShopSettings(settings);

    if (s.isOpen === false) {
        return {
            isOpen: false,
            message: 'We are closed right now and not taking orders. Please try again later or call us.',
            reason: 'manual',
            reasonLabel: 'Aap ne manually shop band ki hui hai — "Shop KHOLEN" dabayein.',
        };
    }

    const today = DAY_NAMES[now.getDay()];
    if (s.offDays.includes(today)) {
        return {
            isOpen: false,
            message: `We are closed today (${today}).`,
            reason: 'offday',
            reasonLabel: `Aaj off day hai (${today}) — off days se hata dein.`,
        };
    }

    if (s.scheduleEnabled) {
        if (!isWithinOperatingHours(s.openingTime, s.closingTime, now)) {
            return {
                isOpen: false,
                message: `We are closed. Open hours: ${s.openingTime} – ${s.closingTime}.`,
                reason: 'hours',
                reasonLabel: `Abhi time schedule ke bahar hai (${s.openingTime} – ${s.closingTime}).`,
            };
        }
    }

    return {
        isOpen: true,
        message: '',
        reason: 'open',
        reasonLabel: s.scheduleEnabled
            ? `Schedule ke andar — ${s.openingTime} se ${s.closingTime} tak.`
            : 'Shop khuli hai — orders accept ho rahe hain.',
    };
}

export function getShopHoursLabel(settings) {
    const s = normalizeShopSettings(settings);
    if (!s.openingTime && !s.closingTime) return '';
    return `${s.openingTime} – ${s.closingTime}`.trim();
}
