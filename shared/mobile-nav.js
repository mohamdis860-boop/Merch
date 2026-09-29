/* ==================== shared/mobile-nav.js ==================== */

(function() {
    'use strict';

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/Pages/') || path.includes('/Auth/') ||
            path.includes('/Support/')) {
            return '../';
        }
        return '';
    }

    const BASE = getBasePath();

    function buildMobileNav() {
        if (document.querySelector('.mobile-bottom-nav')) return;

        const path = window.location.pathname;
        const fileName = path.split('/').pop();

        // تحديد الصفحة الحالية
        const isHome = fileName === 'index.html' || path.endsWith('/');
        const isProducts = fileName === 'products.html' || fileName === 'categories.html' || fileName === 'category-products.html' || fileName === 'search-results.html';
        const isWishlist = fileName === 'wishlist.html';
        const isProfile = fileName === 'profile.html' || path.includes('/Auth/');

        // جيب عدد السلة والمفضلة
        const cartCount = (() => {
            try {
                const cart = window.getCart ? window.getCart() : [];
                return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            } catch { return 0; }
        })();

        const wishlistCount = (() => {
            try {
                return (JSON.parse(localStorage.getItem('wishlist')) || []).length;
            } catch { return 0; }
        })();

        const nav = document.createElement('nav');
        nav.className = 'mobile-bottom-nav';
        nav.innerHTML = `
            <div class="nav-items">
                <a href="${BASE}index.html" class="nav-item ${isHome ? 'active' : ''}">
                    <i class="fas fa-home"></i>
                    <span>الرئيسية</span>
                </a>
                <a href="${BASE}Pages/products.html" class="nav-item ${isProducts ? 'active' : ''}">
                    <i class="fas fa-shopping-bag"></i>
                    <span>المنتجات</span>
                </a>
                <a href="${BASE}Pages/wishlist.html" class="nav-item ${isWishlist ? 'active' : ''}">
                    <i class="fas fa-heart"></i>
                    <span>المفضلة</span>
                    ${wishlistCount > 0 ? `<span class="badge">${wishlistCount}</span>` : ''}
                </a>
                <a href="${BASE}Pages/cart.html" class="nav-item ${fileName === 'cart.html' ? 'active' : ''}">
                    <i class="fas fa-shopping-cart"></i>
                    <span>السلة</span>
                    ${cartCount > 0 ? `<span class="badge">${cartCount}</span>` : ''}
                </a>
                <a href="${BASE}Auth/profile.html" class="nav-item ${isProfile ? 'active' : ''}">
                    <i class="fas fa-user"></i>
                    <span>حسابي</span>
                </a>
            </div>
        `;

        document.body.appendChild(nav);

        // استمع لتحديثات السلة
        window.addEventListener('cartUpdated', updateBadges);
        window.addEventListener('wishlistUpdated', updateBadges);
        window.addEventListener('storage', updateBadges);

        function updateBadges() {
            const newCartCount = (() => {
                try {
                    const cart = window.getCart ? window.getCart() : [];
                    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
                } catch { return 0; }
            })();

            const newWishlistCount = (() => {
                try {
                    return (JSON.parse(localStorage.getItem('wishlist')) || []).length;
                } catch { return 0; }
            })();

            // Update cart badge
            const cartItem = nav.querySelector('.nav-item:nth-child(4)');
            let cartBadge = cartItem.querySelector('.badge');
            if (newCartCount > 0) {
                if (!cartBadge) {
                    cartBadge = document.createElement('span');
                    cartBadge.className = 'badge';
                    cartItem.appendChild(cartBadge);
                }
                cartBadge.textContent = newCartCount;
            } else if (cartBadge) {
                cartBadge.remove();
            }

            // Update wishlist badge
            const wishlistItem = nav.querySelector('.nav-item:nth-child(3)');
            let wishlistBadge = wishlistItem.querySelector('.badge');
            if (newWishlistCount > 0) {
                if (!wishlistBadge) {
                    wishlistBadge = document.createElement('span');
                    wishlistBadge.className = 'badge';
                    wishlistItem.appendChild(wishlistBadge);
                }
                wishlistBadge.textContent = newWishlistCount;
            } else if (wishlistBadge) {
                wishlistBadge.remove();
            }
        }
    }

    function init() {
        // فقط على الموبايل
        if (window.innerWidth <= 768) {
            buildMobileNav();
        }

        // لو المستخدم غير حجم الشاشة
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth <= 768) {
                    buildMobileNav();
                } else {
                    const nav = document.querySelector('.mobile-bottom-nav');
                    if (nav) nav.remove();
                    document.body.style.paddingBottom = '';
                }
            }, 250);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ Mobile nav loaded');
})();