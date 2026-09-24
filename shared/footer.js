/* ==================== shared/footer.js ==================== */
/* بناء الفوتر الموحّد — يتحمّل تلقائياً في كل الصفحات */

(function() {
    'use strict';

    // ===== تحديد مسار الأساس (نفس navbar.js) =====
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/Pages/') || path.includes('/Auth/') ||
            path.includes('/pages/') || path.includes('/auth/')) {
            return '../';
        }
        return '';
    }

    const BASE = getBasePath();

    // ===== بناء الفوتر =====
    function buildFooter() {
        // لو الفوتر الجديد موجود، متعملش حاجة
        if (document.querySelector('.footer-main')) return;

        // شيل الفوتر القديم لو موجود
        const oldFooter = document.querySelector('.footer:not(.footer-main)');
        if (oldFooter) oldFooter.remove();

        const footer = document.createElement('footer');
        footer.className = 'footer-main';
        footer.innerHTML = `
            <div class="footer-container">

                <!-- القسم 1: عن المتجر -->
                <div class="footer-brand">
                    <a href="${BASE}index.html" class="footer-logo">
                        <i class="fas fa-store"></i>
                        متجرنا
                    </a>
                    <p>
                        متجرك الإلكتروني الموثوق — منتجات أصلية، أسعار منافسة،
                        وتوصيل سريع لجميع المحافظات.
                    </p>
                </div>

                <!-- القسم 2: روابط سريعة -->
                <div class="footer-col">
                    <h4>روابط سريعة</h4>
                    <ul>
                        <li><a href="${BASE}index.html">الرئيسية</a></li>
                        <li><a href="${BASE}Pages/products.html">المنتجات</a></li>
                        <li><a href="${BASE}Pages/categories.html">التصنيفات</a></li>
                        <li><a href="${BASE}Pages/about.html">تعرف علينا</a></li>
                    </ul>
                </div>

                <!-- القسم 3: خدمة العملاء -->
                <div class="footer-col">
                    <h4>خدمة العملاء</h4>
                    <ul>
                        <li><a href="${BASE}Pages/contact.html">تواصل معنا</a></li>
                        <li><a href="${BASE}Pages/faq.html">الأسئلة الشائعة</a></li>
                        <li><a href="${BASE}Pages/terms.html">الشروط والأحكام</a></li>
                        <li><a href="${BASE}Pages/privacy.html">سياسة الخصوصية</a></li>
                    </ul>
                </div>

                <!-- القسم 4: تواصل -->
                <div class="footer-col footer-contact">
                    <h4>تواصل معنا</h4>
                    <ul>
                        <li>
                            <i class="fas fa-envelope"></i>
                            <a href="mailto:mohamdis860@gmail.com">mohamdis860@gmail.com</a>
                        </li>
                        <li>
                            <i class="fas fa-phone"></i>
                            <a href="tel:01026106479" dir="ltr">0102 610 6479</a>
                        </li>
                        <li>
                            <i class="fas fa-location-dot"></i>
                            <span>فيصل، الجيزة</span>
                        </li>
                        <li>
                            <i class="fas fa-clock"></i>
                            <span>يومياً — 12 ساعة</span>
                        </li>
                    </ul>
                </div>

            </div>

            <!-- الشريط السفلي -->
            <div class="footer-bottom">
                <p>
                    &copy; <span id="footerYear"></span> متجرنا — جميع الحقوق محفوظة
                </p>
                <p>
                    صُنع بـ <span class="heart">❤</span> في مصر
                </p>
            </div>
        `;

        document.body.appendChild(footer);

        // ===== السنة الحالية =====
        const yearEl = document.getElementById('footerYear');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    // ===== التهيئة =====
    function init() {
        buildFooter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ Footer loaded');
})();