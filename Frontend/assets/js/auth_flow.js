// SikmaV3 - assets/js/auth_flow.js (Diperbarui)

const AuthFlow = {
    // DOM Elements related to Auth
    loginForm: null,
    registerForm: null,
    authContainer: null,
    appContainer: null,
    logoutLink: null,

    // Login Form Elements
    loginEmailNimInput: null,
    loginPasswordInput: null,
    rememberMeCheckbox: null,
    forgotPasswordLink: null,
    loginMessageDiv: null,
    loginSubmitBtn: null,

    // Register Form Elements
    registerNamaLengkapInput: null,
    registerEmailInput: null,
    registerNimInput: null,
    registerSemesterSelect: null,
    registerPasswordInput: null,
    registerConfirmPasswordInput: null,
    registerTermsCheckbox: null,
    registerMessageDiv: null,
    registerSubmitBtn: null,
    
    // Profile Completion Overlay
    profileCompletionOverlay: null,
    profileCompletionMessageDiv: null,
    goToProfileCompletionBtn: null,

    isInitialized: false,

    initializeAuthForms: () => {
        if (AuthFlow.isInitialized) return; // Prevent re-initialization

        console.log("AuthFlow: Initializing authentication forms...");

        AuthFlow.authContainer = UI.getElement('#authContainer');
        AuthFlow.appContainer = UI.getElement('#appContainer');
        AuthFlow.logoutLink = UI.getElement('#nav-logout');

        // Login Form
        AuthFlow.loginForm = UI.getElement('#loginForm');
        AuthFlow.loginEmailNimInput = UI.getElement('#login_email_nim');
        AuthFlow.loginPasswordInput = UI.getElement('#login_password');
        AuthFlow.rememberMeCheckbox = UI.getElement('#remember_me');
        AuthFlow.forgotPasswordLink = UI.getElement('#forgotPasswordLink');
        AuthFlow.loginMessageDiv = UI.getElement('#loginMessage');
        AuthFlow.loginSubmitBtn = AuthFlow.loginForm ? AuthFlow.loginForm.querySelector('button[type="submit"]') : null;

        // Register Form
        AuthFlow.registerForm = UI.getElement('#registerForm');
        AuthFlow.registerNamaLengkapInput = UI.getElement('#register_nama_lengkap');
        AuthFlow.registerEmailInput = UI.getElement('#register_email');
        AuthFlow.registerNimInput = UI.getElement('#register_nim');
        AuthFlow.registerSemesterSelect = UI.getElement('#register_semester');
        AuthFlow.registerPasswordInput = UI.getElement('#register_password');
        AuthFlow.registerConfirmPasswordInput = UI.getElement('#register_confirm_password');
        AuthFlow.registerTermsCheckbox = UI.getElement('#register_terms');
        AuthFlow.registerMessageDiv = UI.getElement('#registerMessage');
        AuthFlow.registerSubmitBtn = AuthFlow.registerForm ? AuthFlow.registerForm.querySelector('button[type="submit"]') : null;

        // Profile Completion
        AuthFlow.profileCompletionOverlay = UI.getElement('#profileCompletionOverlay');
        AuthFlow.profileCompletionMessageDiv = UI.getElement('#profileCompletionMessage');
        AuthFlow.goToProfileCompletionBtn = UI.getElement('#goToProfileCompletionBtn');

        const switchToRegisterLink = UI.getElement('#switchToRegister');
        const switchToLoginLink = UI.getElement('#switchToLogin');

        if (switchToRegisterLink) {
            switchToRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                AuthFlow.showRegisterForm();
            });
        }
        if (switchToLoginLink) {
            switchToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                AuthFlow.showLoginForm();
            });
        }

        if (AuthFlow.loginForm && AuthFlow.loginSubmitBtn) {
            AuthFlow.loginForm.addEventListener('submit', AuthFlow.handleLoginSubmit);
        }
        if (AuthFlow.registerForm && AuthFlow.registerSubmitBtn) {
            AuthFlow.registerForm.addEventListener('submit', AuthFlow.handleRegisterSubmit);
        }
        
        if (AuthFlow.logoutLink) {
            AuthFlow.logoutLink.removeEventListener('click', AuthFlow.handleLogout); // Prevent multiple listeners
            AuthFlow.logoutLink.addEventListener('click', AuthFlow.handleLogout);
        }

        if (AuthFlow.forgotPasswordLink) {
            AuthFlow.forgotPasswordLink.addEventListener('click', AuthFlow.handleForgotPasswordLinkClick);
        }

        if (AuthFlow.goToProfileCompletionBtn) {
            AuthFlow.goToProfileCompletionBtn.addEventListener('click', () => {
                if (AppCore && typeof AppCore.navigateToPage === 'function') {
                    AppCore.navigateToPage('page-profile', UI.getElement('a[data-page="page-profile"]'), 'Lengkapi Profil');
                    if (AuthFlow.profileCompletionOverlay) {
                        UI.hideElement(AuthFlow.profileCompletionOverlay);
                        document.body.style.overflow = ''; // Pastikan scroll body kembali normal
                    }
                }
            });
        }

        // Show login form by default if auth container is visible
        if (AuthFlow.authContainer && AuthFlow.authContainer.style.display !== 'none') {
            AuthFlow.showLoginForm();
        }
        AuthFlow.isInitialized = true;
        console.log("AuthFlow: Authentication forms initialized.");
    },

    showLoginForm: () => {
        if (AuthFlow.loginForm) UI.showElement(AuthFlow.loginForm, 'block');
        if (AuthFlow.registerForm) UI.hideElement(AuthFlow.registerForm);
        if (AuthFlow.registerMessageDiv) UI.hideMessage(AuthFlow.registerMessageDiv);
        if (AuthFlow.loginForm) UI.resetForm(AuthFlow.loginForm); // Reset form fields
        document.title = `${window.sikmaApp.appName || 'SIKMA'} - Login`;
    },

    showRegisterForm: () => {
        if (AuthFlow.loginForm) UI.hideElement(AuthFlow.loginForm);
        if (AuthFlow.registerForm) UI.showElement(AuthFlow.registerForm, 'block');
        if (AuthFlow.loginMessageDiv) UI.hideMessage(AuthFlow.loginMessageDiv);
        if (AuthFlow.registerForm) UI.resetForm(AuthFlow.registerForm); // Reset form fields
        document.title = `${window.sikmaApp.appName || 'SIKMA'} - Daftar`;
    },

    handleLoginSubmit: async (e) => {
        e.preventDefault();
        if (AuthFlow.loginMessageDiv) UI.hideMessage(AuthFlow.loginMessageDiv);
        const formData = new FormData(AuthFlow.loginForm);
        // 'remember_me' checkbox value is 'on' if checked, or null if not.
        // Backend should check for its existence.
        // FormData already includes checkbox value if checked.

        UI.showButtonSpinner(AuthFlow.loginSubmitBtn, 'Login', 'Proses Login...');

        const response = await Api.login(formData);
        UI.hideButtonSpinner(AuthFlow.loginSubmitBtn);

        if (response.status === 'success' && response.user) {
            window.sikmaApp.isUserLoggedIn = true;
            window.sikmaApp.initialUserData = response.user;
            
            UI.hideElement(AuthFlow.authContainer);
            UI.showElement(AuthFlow.appContainer, 'flex'); // appContainer uses flex
            
            AppCore.initializeMainApp(); // Initialize the main application UI and logic
            AuthFlow.checkInitialProfileCompletion(); // Check and handle profile completion

        } else {
            const errorMessage = response.errors ? response.errors : (response.message || 'Login gagal, coba lagi.');
            UI.showMessage(AuthFlow.loginMessageDiv, errorMessage, 'error');
        }
    },

    handleRegisterSubmit: async (e) => {
        e.preventDefault();
        if (AuthFlow.registerMessageDiv) UI.hideMessage(AuthFlow.registerMessageDiv);
        
        // Basic client-side validation for terms
        if (AuthFlow.registerTermsCheckbox && !AuthFlow.registerTermsCheckbox.checked) {
            UI.showMessage(AuthFlow.registerMessageDiv, 'Anda harus menyetujui Syarat & Ketentuan untuk mendaftar.', 'error');
            return;
        }

        const formData = new FormData(AuthFlow.registerForm);
        UI.showButtonSpinner(AuthFlow.registerSubmitBtn, 'Daftar', 'Proses Daftar...');

        const response = await Api.register(formData);
        UI.hideButtonSpinner(AuthFlow.registerSubmitBtn);

        if (response.status === 'success') {
            UI.showMessage(AuthFlow.registerMessageDiv, response.message || 'Registrasi berhasil! Silakan login.', 'success', 8000); // Longer display
            UI.resetForm(AuthFlow.registerForm);
            setTimeout(AuthFlow.showLoginForm, 3000); // Switch to login form after a delay
        } else {
            // Display detailed errors if available
            const errorMessage = response.errors ? response.errors : (response.message || 'Registrasi gagal, coba lagi.');
            UI.showMessage(AuthFlow.registerMessageDiv, errorMessage, 'error');
        }
    },

    handleLogout: async (e) => {
        if (e) e.preventDefault();
        
        // Optional: Show a confirmation dialog
        // const confirmLogout = await UI.showConfirmationModal("Konfirmasi Logout", "Apakah Anda yakin ingin keluar dari aplikasi?");
        // if (!confirmLogout) return;

        const response = await Api.logout();
        if (response.status === 'success' || response.action === 'logout_required') { // Handle if session already expired on server
            window.sikmaApp.isUserLoggedIn = false;
            window.sikmaApp.initialUserData = null;
            
            AppCore.resetMainAppUI();
            UI.hideElement(AuthFlow.appContainer);
            UI.showElement(AuthFlow.authContainer, 'flex');
            AuthFlow.showLoginForm();
            
            // Clear theme from localStorage and cookie (AppCore might also do this)
            localStorage.removeItem('theme');
            localStorage.removeItem('sidebarCollapsed');
            document.cookie = "theme=;path=/;max-age=0;SameSite=Lax";
            document.body.classList.remove('dark-theme'); // Ensure theme is visually reset

            console.log("AuthFlow: User logged out successfully.");
        } else {
            // Show message in header or a global notification area
            const headerMessageArea = UI.getElement('#pageHeaderMessage') || UI.getElement('#pageHeader'); // Assuming a message area in header
            UI.showMessage(headerMessageArea || 'body', response.message || 'Logout gagal.', 'error', 3000);
        }
    },

    checkSessionStatus: async () => {
        // Called if PHP didn't initialize the app (e.g., user opened a new tab)
        if (window.sikmaApp.isUserLoggedIn && window.sikmaApp.initialUserData && window.sikmaApp.mainAppFullyInitialized) {
            // Already handled by PHP pre-load or a previous check, and app is running
            AuthFlow.checkInitialProfileCompletion(); // Re-check profile completion state
            return;
        }

        console.log("AuthFlow: Checking session status with API...");
        const response = await Api.checkSession();
        if (response.status === 'success' && response.loggedIn && response.user) {
            window.sikmaApp.isUserLoggedIn = true;
            window.sikmaApp.initialUserData = response.user;

            UI.hideElement(AuthFlow.authContainer);
            UI.showElement(AuthFlow.appContainer, 'flex');
            if (!window.sikmaApp.mainAppFullyInitialized) {
                AppCore.initializeMainApp();
            } else {
                // App was initialized but maybe user data got stale, update UI
                UI.updateSharedUserUI(response.user);
            }
            AuthFlow.checkInitialProfileCompletion();
        } else {
            window.sikmaApp.isUserLoggedIn = false;
            window.sikmaApp.initialUserData = null;
            if (window.sikmaApp.mainAppFullyInitialized) {
                AppCore.resetMainAppUI(); // Reset if app was running
            }
            UI.hideElement(AuthFlow.appContainer);
            UI.showElement(AuthFlow.authContainer, 'flex');
            AuthFlow.showLoginForm();
        }
    },

    checkInitialProfileCompletion: () => {
        if (!window.sikmaApp.isUserLoggedIn || !window.sikmaApp.initialUserData) {
            return; // Not logged in
        }
        
        const needsCompletion = !window.sikmaApp.initialUserData.is_profile_complete;
        window.sikmaApp.needsProfileCompletion = needsCompletion;

        if (needsCompletion) {
            if (AuthFlow.profileCompletionOverlay) {
                UI.showElement(AuthFlow.profileCompletionOverlay, 'flex');
                document.body.style.overflow = 'hidden'; // Prevent body scroll
                // Pesan sudah ada di HTML, bisa diupdate jika perlu
                // UI.showMessage(AuthFlow.profileCompletionMessageDiv, 'Harap lengkapi profil Anda untuk melanjutkan.', 'info', 0);
            } else {
                UI.showMessage(UI.getElement('#pageHeader') || 'body', 'Profil Anda belum lengkap. Harap lengkapi data diri Anda.', 'warning', 0);
            }
            
            AppCore.restrictNavigation(true, 'page-profile'); // Restrict nav, allow 'page-profile'
            // Navigasi ke halaman profil akan dihandle oleh tombol di overlay atau otomatis jika diinginkan
            // AppCore.navigateToPage('page-profile', null, 'Lengkapi Profil'); 
        } else {
            if (AuthFlow.profileCompletionOverlay && AuthFlow.profileCompletionOverlay.style.display !== 'none') {
                UI.hideElement(AuthFlow.profileCompletionOverlay);
                document.body.style.overflow = '';
            }
            AppCore.restrictNavigation(false); // Allow full navigation
        }
    },

    handleForgotPasswordLinkClick: (e) => {
        e.preventDefault();
        // Sembunyikan form login/register, tampilkan UI Lupa Password (bisa modal atau view baru)
        const email = prompt("Masukkan alamat email Anda untuk reset password:");
        if (email && email.trim() !== "") {
            AuthFlow.handleForgotPasswordSubmit(email.trim());
        } else if (email !== null) { // User tidak cancel tapi input kosong
            UI.showMessage(AuthFlow.loginMessageDiv, "Alamat email tidak boleh kosong.", "error");
        }
    },

    handleForgotPasswordSubmit: async (email) => {
        if (AuthFlow.loginMessageDiv) UI.hideMessage(AuthFlow.loginMessageDiv);
        // UI.showButtonSpinner(someButton, 'Kirim Instruksi'); // Jika ada tombol khusus
        UI.showMessage(AuthFlow.loginMessageDiv, "Memproses permintaan reset password...", "info", 0);

        const response = await Api.forgotPassword(email);
        // UI.hideButtonSpinner(someButton);

        if (response.status === 'success') {
            UI.showMessage(AuthFlow.loginMessageDiv, response.message || "Jika email terdaftar, instruksi reset password telah dikirim.", "success", 10000);
        } else {
            UI.showMessage(AuthFlow.loginMessageDiv, response.message || "Gagal mengirim instruksi reset password.", "error");
        }
    }
};
