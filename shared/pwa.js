/* ==================== shared/pwa.js ==================== */
/* PWA — GitHub Pages Edition */

(function() {
    'use strict';

    const BASE_PATH = '/Merch';
    let deferredPrompt = null;
    let swRegistration = null;

    const DISMISSED_KEY = 'pwa-install-dismissed';
    const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

    function isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    function wasDismissed() {
        try {
            const dismissed = localStorage.getItem(DISMISSED_KEY);
            if (!dismissed) return false;
            return Date.now() - parseInt(dismissed) < DISMISS_DURATION;
        } catch {
            return false;
        }
    }

    function buildInstallButton() {
        if (document.querySelector('.pwa-install-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'pwa-install-btn';
        btn.type = 'button';
        btn.innerHTML = `
            <i class="fas fa-download"></i>
            <span>ثبت التطبيق</span>
            <span class="close-icon" id="pwaCloseBtn">
                <i class="fas fa-times"></i>
            </span>
        `;

        document.body.appendChild(btn);

        btn.addEventListener('click', async (e) => {
            if (e.target.closest('#pwaCloseBtn')) {
                btn.classList.remove('show');
                try {
                    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
                } catch {}
                if (window.showToast) {
                    window.showToast('ممكن تثبت التطبيق في أي وقت', 'info');
                }
                return;
            }

            if (!deferredPrompt) {
                if (window.showToast) {
                    window.showToast('استخدم قائمة المتصفح → "أضف للشاشة الرئيسية"', 'info');
                }
                return;
            }

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log('📱 PWA Install:', outcome);

            if (outcome === 'accepted') {
                if (window.showToast) {
                    window.showToast('✅ تم تثبيت التطبيق بنجاح', 'success');
                }
            }

            deferredPrompt = null;
            btn.classList.remove('show');
        });
    }

    function showInstallButton() {
        const btn = document.querySelector('.pwa-install-btn');
        if (!btn) return;
        if (isPWA()) return;
        if (wasDismissed()) return;

        setTimeout(() => {
            btn.classList.add('show');
        }, 3000);
    }

    function showUpdateBanner(newWorker) {
        if (document.querySelector('.pwa-update-banner')) return;

        const banner = document.createElement('div');
        banner.className = 'pwa-update-banner show';
        banner.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>فيه تحديث جديد!</span>
            <button id="updatePwaBtn">تحديث</button>
        `;

        document.body.appendChild(banner);

        banner.querySelector('#updatePwaBtn').addEventListener('click', () => {
            newWorker.postMessage('SKIP_WAITING');
            banner.remove();
        });
    }

    async function registerSW() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ SW not supported');
            return;
        }

        try {
            const swPath = `${BASE_PATH}/sw.js`;

            swRegistration = await navigator.serviceWorker.register(swPath, {
                scope: `${BASE_PATH}/`
            });

            console.log('✅ SW registered:', swRegistration.scope);

            swRegistration.addEventListener('updatefound', () => {
                const newWorker = swRegistration.installing;
                console.log('🔄 New version found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner(newWorker);
                    }
                });
            });

            setInterval(() => {
                swRegistration.update();
            }, 60 * 60 * 1000);

        } catch (err) {
            console.error('❌ SW registration failed:', err);
        }
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 beforeinstallprompt fired');
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        console.log('✅ App installed');
        const btn = document.querySelector('.pwa-install-btn');
        if (btn) btn.classList.remove('show');
        deferredPrompt = null;
        if (window.showToast) {
            window.showToast('🎉 شكراً لتثبيت التطبيق!', 'success');
        }
    });

    window.addEventListener('online', () => {
        if (window.showToast) window.showToast('✅ رجع الاتصال', 'success');
    });

    window.addEventListener('offline', () => {
        if (window.showToast) window.showToast('⚠️ لا يوجد اتصال', 'warning');
    });

    function init() {
        buildInstallButton();
        registerSW();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PWA = {
        isPWA,
        isRegistered: () => !!swRegistration,
        update: () => swRegistration?.update()
    };

    console.log('✅ PWA module loaded');
})();