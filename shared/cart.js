/* ==================== shared/cart.js ==================== */
/* إدارة السلة لكل مستخدم على حدة */

(function() {
    'use strict';

    const GUEST_KEY = 'cart_guest';
    const LEGACY_KEY = 'cart';  // المفتاح القديم

    // ===== Migration: نقل السلة القديمة =====
    function migrateLegacyCart() {
        try {
            const legacy = localStorage.getItem(LEGACY_KEY);
            if (!legacy) return;

            console.log('🔄 Migration: نقل السلة القديمة...');

            const oldCart = JSON.parse(legacy);
            if (Array.isArray(oldCart) && oldCart.length > 0) {
                // ادمجها في سلة الزائر
                const guestCart = JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
                const merged = [...guestCart];

                oldCart.forEach(oldItem => {
                    const existing = merged.find(m => String(m.id) === String(oldItem.id));
                    if (existing) {
                        existing.quantity += oldItem.quantity || 1;
                    } else {
                        merged.push(oldItem);
                    }
                });

                localStorage.setItem(GUEST_KEY, JSON.stringify(merged));
            }

            localStorage.removeItem(LEGACY_KEY);
            console.log('✅ Migration complete');
        } catch (e) {
            console.warn('⚠️ Migration failed:', e);
        }
    }

    // شغّل الـ migration أول ما الملف يتحمّل
    migrateLegacyCart();

    // ===== تحديد مفتاح السلة =====
    function getCartKey() {
        const userId = window.currentUser?.id;
        return userId ? `cart_${userId}` : GUEST_KEY;
    }

    // ===== قراءة السلة =====
    window.getCart = function() {
        try {
            const key = getCartKey();
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('⚠️ فشل قراءة السلة:', e);
            return [];
        }
    };

    // ===== حفظ السلة =====
    window.saveCart = function(cart) {
        try {
            const key = getCartKey();
            localStorage.setItem(key, JSON.stringify(cart || []));
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (e) {
            console.warn('⚠️ فشل حفظ السلة:', e);
        }
    };

    // ===== إضافة منتج =====
    window.addToCartItem = function(productId, productName, price, imageUrl) {
        const cart = window.getCart();
        const existing = cart.find(item => String(item.id) === String(productId));

        if (existing) {
            existing.quantity += 1;
            window.showToast(`✅ تم زيادة كمية "${productName}"`, 'success');
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: price,
                image: imageUrl || null,
                quantity: 1
            });
            window.showToast(`✅ تم إضافة "${productName}" إلى السلة`, 'success');
        }

        window.saveCart(cart);
    };

    // ===== حذف منتج =====
    window.removeFromCart = function(productId) {
        const cart = window.getCart();
        const item = cart.find(i => String(i.id) === String(productId));
        const newCart = cart.filter(i => String(i.id) !== String(productId));
        window.saveCart(newCart);
        if (item) window.showToast(`🗑️ تم حذف "${item.name}" من السلة`, 'info');
    };

    // ===== تفريغ السلة =====
    window.clearCartItems = function() {
        window.saveCart([]);
        window.showToast('🗑️ تم تفريغ السلة', 'info');
    };

    // ===== نقل سلة الزائر للمستخدم الجديد =====
    window.mergeGuestCart = function(userId) {
        try {
            const guestCart = JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
            if (guestCart.length === 0) return;

            console.log('🔄 دمج سلة الزائر مع المستخدم:', userId);

            const userKey = `cart_${userId}`;
            const userCart = JSON.parse(localStorage.getItem(userKey)) || [];

            // دمج السلتين
            guestCart.forEach(guestItem => {
                const existing = userCart.find(u => String(u.id) === String(guestItem.id));
                if (existing) {
                    existing.quantity += guestItem.quantity;
                } else {
                    userCart.push(guestItem);
                }
            });

            localStorage.setItem(userKey, JSON.stringify(userCart));
            localStorage.removeItem(GUEST_KEY);

            console.log('✅ تم دمج السلة بنجاح');

            // إشعار بتحديث السلة
            window.dispatchEvent(new CustomEvent('cartUpdated'));

        } catch (e) {
            console.warn('⚠️ فشل دمج السلة:', e);
        }
    };

    // ===== مسح سلة مستخدم معين (اختياري) =====
    window.clearUserCart = function(userId) {
        if (userId) {
            localStorage.removeItem(`cart_${userId}`);
        }
    };

    console.log('✅ Cart module loaded');
})();