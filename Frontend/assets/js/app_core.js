// SikmaV3 - assets/js/app_core.js (Diperbarui)

const AppCore = {
    // DOM Elements
    pageSidebar: null,
    sidebarToggleBtn: null,
    mainContentWrapper: null,
    pageHeader: null,
    navLinks: null,
    pages: null,
    darkModeToggleSettings: null, // Toggle di halaman settings
    darkModeToggleHeader: null,   // Toggle di header

    // App State
    isNavigationRestricted: false,
    allowedPageDuringRestriction: '',
    isInitialized: false,
    activePageId: null,

    initializeMainApp: () => {
        if (AppCore.isInitialized && window.sikmaApp.mainAppFullyInitialized) {
            // Jika sudah diinisialisasi dan user hanya kembali ke tab,
            // mungkin hanya perlu update UI atau cek sesi ringan.
            // AuthFlow.checkSessionStatus() akan menangani ini.
            console.log("AppCore: Main app already initialized. Possibly re-checking state.");
            AuthFlow.checkInitialProfileCompletion(); // Pastikan state restriksi navigasi benar
            return;
        }
        console.log("AppCore: Initializing main application components...");

        // Cache DOM elements
        AppCore.pageSidebar = UI.getElement('#pageSidebar');
        AppCore.sidebarToggleBtn = UI.getElement('#sidebarToggleBtn');
        AppCore.mainContentWrapper = UI.getElement('#mainContentWrapper');
        AppCore.pageHeader = UI.getElement('#pageHeader');
        AppCore.navLinks = UI.getAllElements('.navigation ul li a[data-page]');
        AppCore.pages = UI.getAllElements('.page-content');
        AppCore.darkModeToggleSettings = UI.getElement('#darkModeToggleSettings');
        AppCore.darkModeToggleHeader = UI.getElement('#darkModeToggleHeader');


        if (!AppCore.mainContentWrapper || !AppCore.pageSidebar || AppCore.navLinks.length === 0) {
            console.error("AppCore: Critical layout elements not found. Aborting initialization.");
            UI.showElement(AuthFlow.authContainer, 'flex'); // Tampilkan login jika UI utama gagal load
            UI.hideElement(AuthFlow.appContainer);
            return;
        }
        
        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            UI.updateSharedUserUI(window.sikmaApp.initialUserData);
            // Pemanggilan PageSettings.populateSettingsForm dan PageProfile.loadAndDisplayProfileData
            // akan di-trigger oleh navigateToPage saat halaman tersebut aktif.
        }

        AppCore._initSidebar();
        AppCore._initTheme(); // Inisialisasi tema (termasuk kedua toggle)
        AppCore._initNavigation();
        AppCore._initHeaderScroll();
        AppCore._initGlobalEventListeners();

        // Tentukan halaman awal
        // AuthFlow.checkInitialProfileCompletion() akan menangani navigasi jika profil belum lengkap
        if (!(window.sikmaApp && window.sikmaApp.needsProfileCompletion)) {
            // Coba ambil halaman dari URL hash jika ada, atau default ke home
            const hashPage = window.location.hash.substring(1); // Hapus #
            const initialPageId = AppCore.isValidPageId(hashPage) ? hashPage : 'page-home';
            const initialNavLink = UI.getElement(`.navigation ul li a[data-page="${initialPageId}"]`);
            const initialPageTitle = initialNavLink?.querySelector('.nav-text')?.textContent || (initialPageId === 'page-home' ? 'Dashboard' : 'Halaman');
            AppCore.navigateToPage(initialPageId, initialNavLink, initialPageTitle);
        } else {
            // Jika profil belum lengkap, AuthFlow akan mengarahkan ke page-profile
            // Kita bisa set activePageId di sini agar AppCore tahu halaman mana yang seharusnya aktif
            // meskipun navigasi dibatasi.
            AppCore.activePageId = 'page-profile';
        }
        
        AppCore.isInitialized = true;
        window.sikmaApp.mainAppFullyInitialized = true;
        console.log("AppCore: Main application components initialized.");
    },

    isValidPageId: (pageId) => {
        if (!pageId) return false;
        const pageElement = UI.getElement(`#${pageId}`);
        return pageElement && pageElement.classList.contains('page-content');
    },

    _initSidebar: () => {
        if (AppCore.sidebarToggleBtn && AppCore.pageSidebar) {
            AppCore.sidebarToggleBtn.removeEventListener('click', AppCore._handleSidebarToggle); // Hapus listener lama
            AppCore.sidebarToggleBtn.addEventListener('click', AppCore._handleSidebarToggle);

            const savedSidebarState = localStorage.getItem('sidebarCollapsed');
            AppCore._setSidebarState(savedSidebarState === 'true', false);
        }
    },
    _handleSidebarToggle: () => { // Fungsi terpisah agar bisa di-remove/add
        const isCollapsed = AppCore.pageSidebar.classList.contains('collapsed');
        AppCore._setSidebarState(!isCollapsed);
    },

    _setSidebarState: (collapsed, animate = true) => {
        if (!AppCore.pageSidebar || !AppCore.mainContentWrapper || !AppCore.sidebarToggleBtn) return;

        const icon = AppCore.sidebarToggleBtn.querySelector('i');
        const elementsToAnimate = [AppCore.pageSidebar, AppCore.mainContentWrapper];

        elementsToAnimate.forEach(el => el.style.transition = animate ? '' : 'none');

        if (collapsed) {
            AppCore.pageSidebar.classList.add('collapsed');
            AppCore.mainContentWrapper.classList.add('sidebar-collapsed');
            if (icon) { icon.classList.remove('fa-chevron-left'); icon.classList.add('fa-chevron-right'); }
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            AppCore.pageSidebar.classList.remove('collapsed');
            AppCore.mainContentWrapper.classList.remove('sidebar-collapsed');
            if (icon) { icon.classList.remove('fa-chevron-right'); icon.classList.add('fa-chevron-left'); }
            localStorage.setItem('sidebarCollapsed', 'false');
        }
        
        if (!animate) { // Kembalikan transisi setelah render
            setTimeout(() => elementsToAnimate.forEach(el => el.style.transition = ''), 50);
        }
    },

    _initTheme: () => {
        const themeChangeHandler = function(isDark) {
            AppCore._applyTheme(isDark ? 'dark-theme' : 'light-theme', true);
        };

        if (AppCore.darkModeToggleSettings) {
            AppCore.darkModeToggleSettings.removeEventListener('change', AppCore._handleThemeToggleSettings);
            AppCore.darkModeToggleSettings.addEventListener('change', AppCore._handleThemeToggleSettings);
        }
        if (AppCore.darkModeToggleHeader) {
            AppCore.darkModeToggleHeader.removeEventListener('change', AppCore._handleThemeToggleHeader);
            AppCore.darkModeToggleHeader.addEventListener('change', AppCore._handleThemeToggleHeader);
        }

        const cookieTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
        const storedTheme = cookieTheme || localStorage.getItem('theme') || 'light-theme';
        AppCore._applyTheme(storedTheme, false); // Terapkan tema awal tanpa interaksi pengguna
    },
    _handleThemeToggleSettings: function() { // 'this' akan merujuk ke elemen
        AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
    },
    _handleThemeToggleHeader: function() { // 'this' akan merujuk ke elemen
        AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
    },

    _applyTheme: (theme, fromUserInteraction = false) => {
        const isDark = theme === 'dark-theme';
        document.body.classList.toggle('dark-theme', isDark);
        document.body.classList.toggle('light-theme', !isDark); // Tambahkan kelas light-theme juga

        if (AppCore.darkModeToggleSettings) AppCore.darkModeToggleSettings.checked = isDark;
        if (AppCore.darkModeToggleHeader) AppCore.darkModeToggleHeader.checked = isDark;

        if (fromUserInteraction) {
            const cookieOptions = ";path=/;max-age=" + (60 * 60 * 24 * 30) + ";SameSite=Lax";
            document.cookie = `theme=${theme}${cookieOptions}`;
            localStorage.setItem('theme', theme);
        }
        // Dispatch custom event agar komponen lain bisa merespon perubahan tema (misal: chart)
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
    },

    _initNavigation: () => {
        AppCore.navLinks.forEach(link => {
            link.removeEventListener('click', AppCore._handleNavLinkClick); // Hapus listener lama
            link.addEventListener('click', AppCore._handleNavLinkClick);
        });
        // Handle back/forward browser buttons
        window.addEventListener('popstate', AppCore._handlePopState);
    },
    _handleNavLinkClick: function(e) { // 'this' akan merujuk ke elemen <a>
        e.preventDefault();
        const pageId = this.dataset.page;
        const pageTitle = this.querySelector('.nav-text')?.textContent || 'Halaman';

        if (AppCore.isNavigationRestricted && pageId !== AppCore.allowedPageDuringRestriction) {
            UI.showMessage(AppCore.pageHeader || AppCore.mainContentWrapper, 'Harap lengkapi profil Anda terlebih dahulu untuk mengakses halaman ini.', 'warning', 3000);
            return;
        }
        AppCore.navigateToPage(pageId, this, pageTitle);
    },
    _handlePopState: (event) => {
        const pageId = event.state?.pageId || (window.location.hash.substring(1) || 'page-home');
        if (AppCore.isValidPageId(pageId)) {
            const navLink = UI.getElement(`.navigation ul li a[data-page="${pageId}"]`);
            const pageTitle = navLink?.querySelector('.nav-text')?.textContent || 'Halaman';
            AppCore.navigateToPage(pageId, navLink, pageTitle, false); // false untuk tidak pushState lagi
        } else {
            // Jika pageId tidak valid dari popstate, arahkan ke home
            AppCore.navigateToPage('page-home', UI.getElement('.navigation ul li a[data-page="page-home"]'), 'Dashboard', false);
        }
    },

    navigateToPage: (pageId, clickedElement = null, pageTitleSuffix = null, addToHistory = true) => {
        if (!AppCore.isValidPageId(pageId)) {
            console.warn(`AppCore: Page with id "${pageId}" not found. Redirecting to home.`);
            pageId = 'page-home'; // Default ke home jika halaman tidak valid
            clickedElement = UI.getElement(`.navigation ul li a[data-page="page-home"]`);
            pageTitleSuffix = 'Dashboard';
        }
        
        AppCore.activePageId = pageId; // Update active page
        AppCore.pages.forEach(page => UI.toggleClass(page, 'active', page.id === pageId));

        AppCore.navLinks.forEach(link => link.classList.remove('active-link'));
        const targetNavLink = clickedElement || UI.getElement(`.navigation ul li a[data-page="${pageId}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active-link');
        }
        
        const baseTitle = window.sikmaApp.appName || 'SIKMA';
        let newTitle = baseTitle;
        if (pageTitleSuffix && pageTitleSuffix.toLowerCase() !== 'utama' && pageTitleSuffix.toLowerCase() !== 'dashboard') {
            newTitle = `${baseTitle} - ${pageTitleSuffix}`;
        } else if (pageId === 'page-home') {
             newTitle = `${baseTitle} - Dashboard`;
        }
        document.title = newTitle;

        if (addToHistory) {
            // Update URL hash untuk navigasi browser dan bookmark
            // Gunakan path relatif jika aplikasi tidak di root
            const newUrl = `#${pageId}`;
            history.pushState({ pageId: pageId }, newTitle, newUrl);
        }

        if (AppCore.mainContentWrapper) AppCore.mainContentWrapper.scrollTop = 0;

        // Panggil page-specific initializers/loaders
        // Pastikan modul halaman sudah ada (misal PageHome, PageProfile)
        // dan memiliki metode 'loadPageData' atau 'initializePage'
        switch (pageId) {
            case 'page-home':
                if (typeof PageHome !== 'undefined' && typeof PageHome.loadPageData === 'function') PageHome.loadPageData();
                else if (typeof PageHome !== 'undefined' && typeof PageHome.initialize === 'function') PageHome.initialize(); // Fallback
                break;
            case 'page-profile':
                if (typeof PageProfile !== 'undefined' && typeof PageProfile.loadPageData === 'function') PageProfile.loadPageData();
                else if (typeof PageProfile !== 'undefined' && typeof PageProfile.initialize === 'function') PageProfile.initialize();
                break;
            case 'page-settings':
                if (typeof PageSettings !== 'undefined' && typeof PageSettings.loadPageData === 'function') PageSettings.loadPageData();
                else if (typeof PageSettings !== 'undefined' && typeof PageSettings.initialize === 'function') PageSettings.initialize();
                break;
            case 'page-company-detail':
                // Detail perusahaan biasanya dimuat berdasarkan ID, jadi tidak ada loadPageData umum.
                // PageCompanyDetail.displayCompanyDetails(companyId) akan dipanggil dari tempat lain.
                // Jika ada data yang perlu di-reset atau disiapkan saat halaman ini aktif, tambahkan di sini.
                if (typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.preparePage === 'function') PageCompanyDetail.preparePage();
                break;
        }
    },
    
    _initHeaderScroll: () => {
        if (AppCore.pageHeader && AppCore.mainContentWrapper) {
            AppCore.mainContentWrapper.removeEventListener('scroll', AppCore._handleHeaderScroll);
            AppCore.mainContentWrapper.addEventListener('scroll', AppCore._handleHeaderScroll);
        }
    },
    _handleHeaderScroll: () => {
        if (!AppCore.pageHeader || !AppCore.mainContentWrapper) return;
        UI.toggleClass(AppCore.pageHeader, 'scrolled', AppCore.mainContentWrapper.scrollTop > 20);
    },

    _initGlobalEventListeners: () => {
        const mainSearchButton = UI.getElement('#mainSearchButton');
        const mainSearchInput = UI.getElement('#mainSearchInput');

        const performSearch = () => {
            const searchTerm = mainSearchInput.value.trim();
            if (!searchTerm) return;

            if (typeof PageHome !== 'undefined' && typeof PageHome.filterCompaniesBySearch === 'function') {
                if (AppCore.activePageId === 'page-home') {
                    PageHome.filterCompaniesBySearch(searchTerm);
                } else {
                    AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
                    // Tunggu navigasi dan inisialisasi halaman selesai
                    setTimeout(() => {
                        if (UI.getElement('#mainSearchInput')) UI.getElement('#mainSearchInput').value = searchTerm; // Isi ulang search term
                        PageHome.filterCompaniesBySearch(searchTerm);
                    }, 300); // Delay mungkin perlu disesuaikan
                }
            } else {
                console.log("Global search for:", searchTerm);
                UI.showMessage(AppCore.pageHeader, `Pencarian untuk "${searchTerm}" belum diimplementasikan pada halaman ini.`, 'info');
            }
        };

        if (mainSearchButton && mainSearchInput) {
            mainSearchButton.addEventListener('click', performSearch);
            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    },

    resetMainAppUI: () => {
        console.log("AppCore: Resetting main application UI...");
        UI.resetSharedUserUI();

        // Reset halaman-halaman
        if (typeof PageHome !== 'undefined' && typeof PageHome.resetPage === 'function') PageHome.resetPage();
        if (typeof PageProfile !== 'undefined' && typeof PageProfile.resetPage === 'function') PageProfile.resetPage();
        if (typeof PageSettings !== 'undefined' && typeof PageSettings.resetPage === 'function') PageSettings.resetPage();
        if (typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.resetPage === 'function') PageCompanyDetail.resetPage();

        // Reset form yang mungkin masih ada state (meskipun page reset harusnya sudah menangani)
        ['#profileSettingsForm', '#changePasswordForm', '#fullProfileForm', '#itemEntryForm'].forEach(formId => {
            const form = UI.getElement(formId);
            if (form) UI.resetForm(form);
        });
        
        AppCore._setSidebarState(false, false); // Tidak collapsed, tanpa animasi
        AppCore._applyTheme('light-theme', false); // Default ke light, jangan set cookie karena logout akan clear

        // Hapus semua pesan error/info yang mungkin masih tampil
        UI.getAllElements('.auth-message').forEach(msgDiv => UI.hideMessage(msgDiv));
        if (AppCore.pageHeader) UI.removeClass(AppCore.pageHeader, 'scrolled');

        AppCore.restrictNavigation(false);
        if(AppCore.pageSidebar) UI.removeClass(AppCore.pageSidebar, 'profile-incomplete-restricted');
        
        // Hapus hash dari URL
        history.pushState("", document.title, window.location.pathname + window.location.search);

        AppCore.isInitialized = false; // Tandai sebagai belum terinisialisasi lagi
        window.sikmaApp.mainAppFullyInitialized = false;
        console.log("AppCore: Main app UI reset complete.");
    },

    restrictNavigation: (shouldRestrict, allowedPageId = '') => {
        AppCore.isNavigationRestricted = shouldRestrict;
        AppCore.allowedPageDuringRestriction = allowedPageId;

        AppCore.navLinks.forEach(link => {
            const pageId = link.dataset.page;
            const isAllowed = !shouldRestrict || pageId === allowedPageId || pageId === 'nav-logout'; // Logout selalu boleh
            UI.toggleClass(link, 'disabled-nav-link', !isAllowed);
            if (link.parentElement) UI.toggleClass(link.parentElement, 'restricted', !isAllowed);
        });
        if (AppCore.pageSidebar) {
            UI.toggleClass(AppCore.pageSidebar, 'profile-incomplete-restricted', shouldRestrict);
        }
    },

        updatePasswordStrengthIndicator: (passwordInputEl, strengthIndicatorEl) => {
        if (!passwordInputEl || !strengthIndicatorEl) return;

        const value = passwordInputEl.value;
        let strength = 0;
        if (value.length >= 8) strength++; // Minimal 8 karakter
        // Cek kombinasi huruf besar, huruf kecil, angka, simbol
        if (value.match(/[a-z]/) && value.match(/[A-Z]/)) strength++; 
        if (value.match(/\d/)) strength++;
        if (value.match(/[^a-zA-Z\d\s]/)) strength++; // Simbol (bukan huruf, angka, atau spasi)

        const strengthLevels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
        const strengthClasses = ['strength-0', 'strength-1', 'strength-2', 'strength-3', 'strength-4'];
        
        // Hapus kelas strength sebelumnya
        strengthIndicatorEl.className = 'password-strength-indicator'; // Reset ke kelas dasar
        
        if (value.length > 0) {
            strengthIndicatorEl.textContent = strengthLevels[strength] || strengthLevels[0];
            strengthIndicatorEl.classList.add(strengthClasses[strength] || strengthClasses[0]);
        } else {
            strengthIndicatorEl.textContent = ''; // Kosongkan jika input kosong
        }
    },
};

// CSS untuk link navigasi yang dinonaktifkan (bisa juga di file CSS utama)
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('appcore-styles')) {
        const style = document.createElement('style');
        style.id = 'appcore-styles';
        style.textContent = `
            .navigation ul li a.disabled-nav-link {
                opacity: 0.5;
                cursor: not-allowed !important;
                /* pointer-events: none; Dihandle JS, tapi bisa sebagai fallback */
            }
            /* Styling untuk .sidebar.profile-incomplete-restricted sudah ada di sidebar.css */
        `;
        document.head.appendChild(style);
    }
});
