/**
 * RIVO Docs i18n - Lightweight Internationalization System
 * 
 * Usage:
 *   1. Add data-i18n="key.path" to elements you want translated
 *   2. Add data-i18n-placeholder="key.path" for input placeholders
 *   3. Call initI18n() on DOMContentLoaded
 * 
 * Language Switching:
 *   - URL param: ?lang=zh or ?lang=en
 *   - localStorage persistence
 *   - Button click: setLang('zh')
 */

const I18n = {
    currentLang: 'en',
    translations: {},
    supportedLangs: ['en', 'zh'],
    defaultLang: 'en',

    /**
     * Initialize i18n system
     */
    async init() {
        // Priority: URL param > localStorage > browser language > default
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        const storedLang = localStorage.getItem('rivo-docs-lang');
        const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';

        const lang = this.supportedLangs.includes(urlLang) ? urlLang :
            this.supportedLangs.includes(storedLang) ? storedLang :
                browserLang;

        await this.setLang(lang);
    },

    /**
     * Load locale file
     */
    async loadLocale(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error(`i18n: Failed to load locale '${lang}'`, error);
            // Fallback to English if available
            if (lang !== 'en' && !this.translations['en']) {
                await this.loadLocale('en');
            }
        }
    },

    /**
     * Get translation by key path (e.g., "nav.docCenter")
     */
    t(key, fallback = null) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English
                value = this.translations['en'];
                for (const fk of keys) {
                    if (value && typeof value === 'object' && fk in value) {
                        value = value[fk];
                    } else {
                        return fallback || key;
                    }
                }
                break;
            }
        }

        return typeof value === 'string' ? value : (fallback || key);
    },

    /**
     * Set language and update all translated elements
     */
    async setLang(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`i18n: Unsupported language '${lang}', using default`);
            lang = this.defaultLang;
        }

        // Load locale if not cached
        if (!this.translations[lang]) {
            await this.loadLocale(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('rivo-docs-lang', lang);

        // Update HTML lang attribute
        document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';

        // Update all translated elements
        this.updateDOM();

        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);

        // Dispatch event for custom handling
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    },

    /**
     * Update all DOM elements with data-i18n attributes
     */
    updateDOM() {
        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translation = this.t(key);

            // Handle HTML content (for elements with nested tags)
            if (el.dataset.i18nHtml !== undefined) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });

        // Titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });

        // Update language switch buttons
        document.querySelectorAll('[data-lang-switch]').forEach(btn => {
            const btnLang = btn.dataset.langSwitch;
            btn.classList.toggle('active', btnLang === this.currentLang);
        });

        // Update page title if specified
        const titleKey = document.querySelector('title')?.dataset?.i18n;
        if (titleKey) {
            document.title = this.t(titleKey);
        }
    },

    /**
     * Get current language
     */
    getLang() {
        return this.currentLang;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => I18n.init());

// Expose to window for direct button usage
window.I18n = I18n;
window.setLang = (lang) => I18n.setLang(lang);
