/* ==================== shared/theme.js ==================== */
/* Dark/Light Mode Toggle — يتحمّل في كل الصفحات */

(function() {
    'use strict';

    const STORAGE_KEY = 'theme';
    const DEFAULT_THEME = 'dark';

    // ===== تحديد الثيم الابتدائي =====
    function getInitialTheme() {
        // 1. من localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }

        // 2. من إعدادات النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        // 3. الافتراضي: dark
        return DEFAULT_THEME;
    }

    // ===== تطبيق الثيم =====
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // تحديث أيقونة الزر
        updateToggleIcon(theme);

        console.log(`🎨 Theme: ${theme}`);
    }

    // ===== تحديث أيقونة الزر =====
    function updateToggleIcon(theme) {
        const btn = document.querySelector('.theme-toggle');
        if (!btn) return;

        const icon = btn.querySelector('i');
        if (!icon) return;

        if (theme === 'light') {
            // في Light Mode، نعرض قمر (للتبديل لـ Dark)
            icon.className = 'fas fa-moon';
            btn.setAttribute('aria-label', 'تبديل إلى الوضع الليلي');
            btn.setAttribute('title', 'الوضع الليلي');
        } else {
            // في Dark Mode، نعرض شمس (للتبديل لـ Light)
            icon.className = 'fas fa-sun';
            btn.setAttribute('aria-label', 'تبديل إلى الوضع النهاري');
            btn.setAttribute('title', 'الوضع النهاري');
        }
    }

    // ===== إنشاء زر التبديل =====
    function createToggleButton() {
        if (document.querySelector('.theme-toggle')) return;

        // نضيفه جوه الـ navbar لما يتحمّل
        const tryAddButton = () => {
            const navLinks = document.querySelector('.navbar .nav-links');
            if (!navLinks) return false;

            if (document.querySelector('.theme-toggle')) return true;

            const btn = document.createElement('button');
            btn.className = 'theme-toggle';
            btn.type = 'button';
            btn.innerHTML = '<i class="fas fa-sun"></i>';

            btn.addEventListener('click', toggleTheme);

            // نضيفه قبل أيقونة المفضلة
            const wishlist = navLinks.querySelector('.wishlist-badge');
            if (wishlist) {
                navLinks.insertBefore(btn, wishlist);
            } else {
                navLinks.appendChild(btn);
            }

            // تحديث الأيقونة حسب الثيم الحالي
            const currentTheme = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
            updateToggleIcon(currentTheme);

            return true;
        };

        // نحاول نضيفه فوراً
        if (!tryAddButton()) {
            // لو الـ navbar مش جاهز، نستنى
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (tryAddButton() || attempts > 20) {
                    clearInterval(interval);
                }
            }, 100);
        }
    }

    // ===== تبديل الثيم =====
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);

        // Toast (اختياري)
        if (window.showToast) {
            const msg = next === 'light' ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي';
            window.showToast(msg, 'info', 1500);
        }
    }

    // ===== مراقبة تغيير إعدادات النظام =====
    function watchSystemTheme() {
        if (!window.matchMedia) return;

        const media = window.matchMedia('(prefers-color-scheme: light)');

        const handler = (e) => {
            // نغير فقط لو المستخدم مش مختار يدوياً
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                applyTheme(e.matches ? 'light' : 'dark');
            }
        };

        if (media.addEventListener) {
            media.addEventListener('change', handler);
        } else if (media.addListener) {
            media.addListener(handler);
        }
    }

    // ===== التهيئة =====
    function init() {
        // 1. تطبيق الثيم فوراً (قبل ما الصفحة تظهر)
        const initialTheme = getInitialTheme();
        document.documentElement.setAttribute('data-theme', initialTheme);

        // 2. على DOMContentLoaded
        const setup = () => {
            createToggleButton();
            updateToggleIcon(initialTheme);
            watchSystemTheme();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    // نطبق الثيم فوراً (before DOM)
    init();

    // نكشف الدالة للاستخدام الخارجي (اختياري)
    window.toggleTheme = toggleTheme;
    window.getCurrentTheme = () => document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;

    console.log('✅ Theme module loaded');
})();