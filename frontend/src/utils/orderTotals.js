/** Cart totals — no tax; delivery fee only for delivery orders. */
export function calcOrderTotals(cartTotal, settings, orderType = 'delivery') {
    const subtotal = cartTotal || 0;
    const deliveryCharges = settings?.deliveryCharges ?? 150;
    const freeDeliveryMinimum = settings?.freeDeliveryMinimum ?? 2000;
    const taxRate = settings?.taxRate ?? 0;

    let deliveryFee = 0;
    if (orderType === 'delivery' && subtotal > 0) {
        deliveryFee = subtotal >= freeDeliveryMinimum ? 0 : deliveryCharges;
    }

    const taxAmount = (subtotal * taxRate) / 100;

    return {
        subtotal,
        deliveryFee,
        taxAmount,
        taxRate,
        grandTotal: subtotal + deliveryFee + taxAmount,
    };
}

export function itemUnitPrice(item) {
    if (typeof item.price === 'string') {
        return parseFloat(item.price.replace(/Rs\.?/gi, '').replace('$', '').trim()) || 0;
    }
    return item.price || item.rawPrice || 0;
}

export function mapDealToCartItem(d) {
    return {
        id: d._id,
        _id: d._id,
        dealId: d._id,
        name: d.title,
        title: d.title,
        category: d.category,
        cat: d.category,
        price: d.price,
        rawPrice: d.price,
        img: d.image,
        image: d.image,
        sizes: d.sizes || [],
    };
}

export function isDrinkItem(item) {
    const cat = String(item?.category || item?.cat || '').toLowerCase();
    return cat.includes('drink');
}
