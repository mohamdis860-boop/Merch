/* ==================== shared/toast.js ==================== */
/* نظام التنبيهات الموحّد */

(function() {
    'use strict';

    let toastTimeout = null;

    // ===== إنشاء عنصر Toast لو مش موجود =====
    function ensureToastElement() {
        let toast = document.getElementById('sharedToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sharedToast';
            toast.className = 'toast';
            toast.innerHTML = `
                <i class="fas fa-info-circle" id="sharedToastIcon"></i>
                <span id="sharedToastMessage">رسالة</span>
            `;
            document.body.appendChild(toast);
        }
        return toast;
    }

    // ===== دالة عرض التنبيه =====
    window.showToast = function(message, type = 'info', duration = 3000) {
        const toast = ensureToastElement();
        const toastMessage = document.getElementById('sharedToastMessage');
        const toastIcon = document.getElementById('sharedToastIcon');

        // حدد الأيقونة حسب النوع
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toastIcon.className = iconMap[type] || iconMap.info;
        toastMessage.textContent = message;

        // شيل الأنواع القديمة وضيف الجديد
        toast.className = 'toast';
        void toast.offsetWidth; // force reflow
        toast.classList.add('show', type);

        // إخفاء تلقائي
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    };

    console.log('✅ Toast loaded');
})();