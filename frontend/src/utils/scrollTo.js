export function scrollToSection(sectionId, options = {}) {
    const { focusMenuSearch = false, onDone } = options;
    const el = document.getElementById(sectionId);
    if (!el) return;

    const headerOffset = 72;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });

    if (focusMenuSearch && sectionId === 'menu') {
        window.setTimeout(() => {
            document.getElementById('menu-search-input')?.focus();
            onDone?.();
        }, 600);
    } else {
        onDone?.();
    }
}
