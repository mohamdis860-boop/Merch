/* ==================== shared/navbar.js ==================== */
/* بناء الـ Navbar + السلة + Auth — تلقائياً في كل الصفحات */

(function() {
    'use strict';

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/Pages/') || path.includes('/Auth/') ||
            path.includes('/pages/') || path.includes('/auth/')) {
            return '../';
        }
        return '';
    }

    const BASE = getBasePath();

    // ===== بناء الـ Navbar =====
    function buildNavbar() {
        if (document.querySelector('.navbar')) return;

        const nav = document.createElement('nav');
        nav.className = 'navbar';
        nav.innerHTML = `
            <a href="${BASE}index.html" class="logo">
                <i class="fas fa-store"></i>
                متجرنا
            </a>
            <div class="nav-links">
                <a href="${BASE}index.html" data-nav="home">
                    <i class="fas fa-home"></i> <span class="nav-text">الرئيسية</span>
                </a>
                <a href="${BASE}Pages/products.html" data-nav="products">
                    <i class="fas fa-box"></i> <span class="nav-text">المنتجات</span>
                </a>
                <a href="${BASE}Pages/categories.html" data-nav="categories">
                    <i class="fas fa-tags"></i> <span class="nav-text">التصنيفات</span>
                </a>
                <a href="${BASE}Pages/about.html" data-nav="about">
                    <i class="fas fa-info-circle"></i> <span class="nav-text">تعرف علينا</span>
                </a>

                <!-- ✅ مربع البحث -->
                <form class="nav-search" id="navSearchForm" role="search" autocomplete="off">
                    <i class="fas fa-search"></i>
                    <input 
                        type="text" 
                        id="navSearchInput" 
                        placeholder="ابحث عن منتج..." 
                        autocomplete="off"
                    >
                </form>

                <a href="${BASE}Pages/cart.html" class="cart-badge" data-nav="cart">
                    <i class="fas fa-shopping-cart"></i> <span class="nav-text">السلة</span>
                    <span class="badge-count" id="cartBadge" style="display: none;">0</span>
                </a>
                <a href="${BASE}Auth/profile.html" class="profile-btn" id="profileBtn" style="display: none;">
                    <span class="profile-avatar-mini" id="profileAvatarMini">م</span>
                    <span class="profile-name-nav" id="profileNameNav">حسابي</span>
                </a>
            </div>
        `;

        document.body.insertBefore(nav, document.body.firstChild);
    }

    // ===== تفعيل الرابط النشط =====
    function setActiveLink() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || 'index.html';

        const navMap = {
            'index.html': 'home',
            'splash.html': 'home',
            'products.html': 'products',
            'categories.html': 'categories',
            'category-products.html': 'categories',
            'about.html': 'about',
            'cart.html': 'cart',
            'checkout.html': 'cart',
            'product-details.html': 'products'
        };

        const activeNav = navMap[fileName];
        if (activeNav) {
            const activeLink = document.querySelector(`[data-nav="${activeNav}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    }

    // ===== عدّاد السلة (يستخدم getCart) =====
    function updateCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        if (!cartBadge) return;

        try {
            const cart = window.getCart ? window.getCart() : [];
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        } catch (e) {
            console.warn('⚠️ فشل قراءة السلة:', e);
            cartBadge.style.display = 'none';
        }
    }

    window.updateCartBadge = updateCartBadge;

    // ===== التحقق من تسجيل الدخول =====
    async function checkAuth() {
        const profileBtn = document.getElementById('profileBtn');
        const profileAvatarMini = document.getElementById('profileAvatarMini');
        const profileNameNav = document.getElementById('profileNameNav');

        if (!profileBtn) return;

        if (!window.supabase || !window.getSupabase) {
            addLoginButton();
            updateCartBadge();
            return;
        }

        try {
            const supabase = window.getSupabase();
            const { data: { session } } = await supabase.auth.getSession();

            if (session && session.user) {
                const userName = session.user.user_metadata?.name || session.user.email.split('@')[0];
                const userInitial = userName.charAt(0).toUpperCase();

                profileAvatarMini.textContent = userInitial;
                profileNameNav.textContent = userName.split(' ')[0];
                profileBtn.style.display = 'flex';

                window.currentUser = session.user;

                // ✅ دمج سلة الزائر مع المستخدم
                if (window.mergeGuestCart) {
                    window.mergeGuestCart(session.user.id);
                }

                // ✅ تحديث العدّاد بعد الدمج
                updateCartBadge();

            } else {
                window.currentUser = null;
                profileBtn.style.display = 'none';
                addLoginButton();
                updateCartBadge();
            }
        } catch (err) {
            console.warn('⚠️ Auth check failed:', err);
            addLoginButton();
            updateCartBadge();
        }
    }

    // ===== إضافة زر الدخول =====
    function addLoginButton() {
        const profileBtn = document.getElementById('profileBtn');
        if (!profileBtn) return;
        if (document.getElementById('loginBtn')) return;

        const loginBtn = document.createElement('a');
        loginBtn.href = `${BASE}Auth/login.html`;
        loginBtn.className = 'login-btn';
        loginBtn.id = 'loginBtn';
        loginBtn.innerHTML = `
            <i class="fas fa-sign-in-alt"></i>
            <span class="profile-name-nav">دخول</span>
        `;
        profileBtn.parentElement.appendChild(loginBtn);
    }

    // ===== منطق البحث =====
    function setupNavSearch() {
        const form = document.getElementById('navSearchForm');
        const input = document.getElementById('navSearchInput');

        if (!form || !input) return;

        // ✅ املأ الـ input لو فيه q في URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentQ = urlParams.get('q');
        if (currentQ) {
            input.value = currentQ;
        }

        // ✅ امنع الـ submit الافتراضي + روّح لصفحة المنتجات
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = input.value.trim();

            if (!query) {
                // لو فاضي، روح لصفحة المنتجات عادي
                window.location.href = `${BASE}Pages/products.html`;
                return;
            }

            // روح لصفحة المنتجات مع كلمة البحث
            window.location.href = `${BASE}Pages/products.html?q=${encodeURIComponent(query)}`;
        });
    }

    // ===== التهيئة =====
    function init() {
        buildNavbar();
        setActiveLink();

        // استنى cart.js يتحمّل الأول
        if (window.getCart) {
            updateCartBadge();
        } else {
            // لو مش متحمّل، استنى 100ms وجرب تاني
            setTimeout(updateCartBadge, 100);
        }

        checkAuth();
        setupNavSearch();  // ✅ البحث

        // استمع لتحديثات السلة من أي مكان
        window.addEventListener('cartUpdated', updateCartBadge);
        window.addEventListener('storage', function(e) {
            if (e.key && e.key.startsWith('cart')) {
                updateCartBadge();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ Navbar loaded');
})();