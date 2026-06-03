const API_ORIGIN =
    (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/** Turn relative upload paths into full URLs for img src. */
export function resolveImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
    return url;
}
