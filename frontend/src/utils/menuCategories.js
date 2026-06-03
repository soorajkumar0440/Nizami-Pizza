/**
 * Fixed menu navigation — must match admin product categories.
 * label = shown on website tabs
 * dbValue = saved in database (category field on products)
 */

export const MENU_NAV_CATEGORIES = [
    {
        id: 'deals',
        label: 'Deals',
        dbValue: null,
        isDealsSection: true,
    },
    {
        id: 'pizza',
        label: 'Pizza',
        dbValue: 'Pizza',
        aliases: ['pizza'],
    },
    {
        id: 'burger',
        label: 'Burger',
        dbValue: 'Burgers & Zingers',
        aliases: ['burger', 'burgers', 'burgers & zingers', 'zingers', 'zinger'],
    },
    {
        id: 'rolls',
        label: 'Rolls',
        dbValue: 'Rolls',
        aliases: ['rolls', 'roll'],
    },
    {
        id: 'broast',
        label: 'Chicken Broast',
        dbValue: 'Chicken Broast',
        aliases: ['chicken broast', 'broast'],
    },
    {
        id: 'club-sandwich',
        label: 'Club Sandwich',
        dbValue: 'Club Sandwich',
        aliases: ['club sandwich', 'sandwich', 'club sandwish'],
    },
    {
        id: 'drink',
        label: 'Drink',
        dbValue: 'Drink',
        aliases: ['drink', 'drinks'],
    },
];

/** Product form categories — includes Deal which auto-routes to deals section */
export const PRODUCT_CATEGORIES = [
    { label: 'Deal', value: 'Deal', isDealsCategory: true },
    ...MENU_NAV_CATEGORIES.filter((c) => !c.isDealsSection).map(
        (c) => ({
            label: c.label,
            value: c.dbValue,
        })
    ),
];

export const BANNER_CATEGORIES = PRODUCT_CATEGORIES;

export function isDealsSectionItem(item) {
    return String(item?.displayOn || '').toLowerCase() === 'deals';
}

export function normalizeCategory(str) {
    return String(str || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

export function itemMatchesMenuCategory(item, navCat) {
    if (!item || !navCat) return false;
    if (navCat.isDealsSection) return isDealsSectionItem(item);
    if (isDealsSectionItem(item)) return false;

    const itemCat = normalizeCategory(item.cat || item.category);
    const targets = [
        normalizeCategory(navCat.dbValue),
        ...(navCat.aliases || []).map(normalizeCategory),
    ].filter(Boolean);

    return targets.some((t) => itemCat === t || itemCat.includes(t) || t.includes(itemCat));
}

export function findNavCategoryByLabel(label) {
    return MENU_NAV_CATEGORIES.find((c) => c.label === label);
}

export function findNavCategoryByDbValue(dbValue) {
    const n = normalizeCategory(dbValue);
    return MENU_NAV_CATEGORIES.find(
        (c) =>
            !c.isDealsSection &&
            (normalizeCategory(c.dbValue) === n ||
                (c.aliases || []).some((a) => normalizeCategory(a) === n))
    );
}

export function getAdminFilterCategories() {
    return ['All', ...MENU_NAV_CATEGORIES.map((c) => c.label)];
}

export function productMatchesAdminFilter(item, filterLabel) {
    if (filterLabel === 'All') return true;
    const nav = findNavCategoryByLabel(filterLabel);
    if (!nav) return false;
    if (nav.isDealsSection) return isDealsSectionItem(item);
    return itemMatchesMenuCategory(item, nav);
}

export function getPlacementLabel(displayOn) {
    return String(displayOn || '').toLowerCase() === 'deals'
        ? 'Deals section'
        : 'Menu category';
}

/** Match admin banner row to a menu nav tab (flexible name matching). */
export function findBannerForNavCategory(banners, navCat) {
    if (!navCat || !Array.isArray(banners)) return null;

    const db = normalizeCategory(navCat.dbValue || navCat.label);
    const label = normalizeCategory(navCat.label);

    return (
        banners.find((b) => {
            if (b.isActive === false) return false;
            const cn = normalizeCategory(b.categoryName);
            if (cn === db || cn === label) return true;
            if (navCat.isDealsSection && (cn === 'deal' || cn === 'deals')) return true;
            const fromBanner = findNavCategoryByDbValue(b.categoryName);
            return fromBanner?.id === navCat.id;
        }) || null
    );
}
