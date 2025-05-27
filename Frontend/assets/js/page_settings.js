// SikmaV3 - assets/js/page_settings.js (Diperbarui)

const PageSettings = {
    // DOM Elements
    profileSettingsForm: null,
    changePasswordForm: null,
    settingsPageMessageDiv: null, // Pesan umum untuk halaman settings
    
    // Profile Form Elements
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null, // Readonly
    nimInput: null,   // Readonly, Baru ditambahkan di HTML settings
    semesterSelect: null, // Baru ditambahkan di HTML settings
    bioInput: null,
    avatarUploadInput: null,
    avatarPreview: null,
    profileUpdateMessageDiv: null,
    profileSubmitBtn: null,

    // Password Form Elements
    currentPasswordInput: null,
    newPasswordInput: null,
    confirmNewPasswordInput: null,
    newPasswordStrengthIndicator: null,
    passwordChangeMessageDiv: null,
    passwordSubmitBtn: null,

    // Other Settings Elements
    darkModeToggleSettings: null, // Toggle tema di halaman settings
    deactivateAccountBtn: null,
    deactivationMessageDiv: null,

    isPageInitialized: false,

    initialize: () => {
        if (PageSettings.isPageInitialized) return;
        console.log("PageSettings: Initializing...");

        PageSettings.settingsPageMessageDiv = UI.getElement('#settingsPageMessage');

        // Profile form elements
        PageSettings.profileSettingsForm = UI.getElement('#profileSettingsForm');
        if (PageSettings.profileSettingsForm) {
            PageSettings.firstNameInput = UI.getElement('#settings_firstName');
            PageSettings.lastNameInput = UI.getElement('#settings_lastName');
            PageSettings.emailInput = UI.getElement('#settings_email');
            PageSettings.nimInput = UI.getElement('#settings_nim');
            PageSettings.semesterSelect = UI.getElement('#settings_semester');
            PageSettings.bioInput = UI.getElement('#settings_bio');
            PageSettings.avatarUploadInput = UI.getElement('#settings_avatarUpload');
            PageSettings.avatarPreview = UI.getElement('#settings_avatarPreview');
            PageSettings.profileUpdateMessageDiv = UI.getElement('#profileUpdateMessage');
            PageSettings.profileSubmitBtn = PageSettings.profileSettingsForm.querySelector('button[type="submit"]');
            PageSettings.profileSettingsForm.addEventListener('submit', PageSettings.handleProfileUpdateSubmit);
            if(PageSettings.avatarUploadInput) {
                PageSettings.avatarUploadInput.addEventListener('change', PageSettings.handleAvatarPreview);
            }
        }

        // Password form elements
        PageSettings.changePasswordForm = UI.getElement('#changePasswordForm');
        if (PageSettings.changePasswordForm) {
            PageSettings.currentPasswordInput = UI.getElement('#currentPassword');
            PageSettings.newPasswordInput = UI.getElement('#newPassword');
            PageSettings.confirmNewPasswordInput = UI.getElement('#confirmNewPassword');
            PageSettings.newPasswordStrengthIndicator = UI.getElement('#new_password_strength');
            PageSettings.passwordChangeMessageDiv = UI.getElement('#passwordChangeMessage');
            PageSettings.passwordSubmitBtn = PageSettings.changePasswordForm.querySelector('button[type="submit"]');
            PageSettings.changePasswordForm.addEventListener('submit', PageSettings.handleChangePasswordSubmit);
            // Listener untuk password strength indicator (jika belum global)
            if (PageSettings.newPasswordInput && PageSettings.newPasswordStrengthIndicator) {
                PageSettings.newPasswordInput.addEventListener('input', function() {
                    AppCore.updatePasswordStrengthIndicator(this, PageSettings.newPasswordStrengthIndicator);
                });
            }
        }
        
        // Dark mode toggle (sinkronisasi dengan AppCore)
        PageSettings.darkModeToggleSettings = UI.getElement('#darkModeToggleSettings');
        if (PageSettings.darkModeToggleSettings && AppCore) {
            PageSettings.darkModeToggleSettings.checked = document.body.classList.contains('dark-theme');
            PageSettings.darkModeToggleSettings.removeEventListener('change', PageSettings._handleThemeToggle);
            PageSettings.darkModeToggleSettings.addEventListener('change', PageSettings._handleThemeToggle);
        }
        
        // Deactivate account
        PageSettings.deactivateAccountBtn = UI.getElement('#deactivateAccountBtn');
        PageSettings.deactivationMessageDiv = UI.getElement('#deactivationMessage');
        if (PageSettings.deactivateAccountBtn) {
            PageSettings.deactivateAccountBtn.addEventListener('click', PageSettings.handleDeactivateAccount);
        }
        
        PageSettings.isPageInitialized = true;
        console.log("PageSettings: Basic initialization complete.");
    },

    _handleThemeToggle: function() { // 'this' akan merujuk ke checkbox
        if (AppCore && typeof AppCore._applyTheme === 'function') {
            AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
        }
    },
    
    loadPageData: () => {
        console.log("PageSettings: Loading page data...");
        if (!PageSettings.isPageInitialized) {
            PageSettings.initialize();
        }
        // Sembunyikan semua pesan sebelum memuat
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);
        if (PageSettings.settingsPageMessageDiv) UI.hideMessage(PageSettings.settingsPageMessageDiv);
        if (PageSettings.deactivationMessageDiv) UI.hideMessage(PageSettings.deactivationMessageDiv);

        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
        } else {
            // Jika tidak ada data user (seharusnya tidak terjadi jika user login)
            // Mungkin perlu mengambil data dari API atau menampilkan pesan error
            console.warn("PageSettings: No initial user data found to populate form.");
            UI.showMessage(PageSettings.settingsPageMessageDiv, "Gagal memuat data pengguna.", "error");
        }
        // Update status toggle tema
        if (PageSettings.darkModeToggleSettings) {
            PageSettings.darkModeToggleSettings.checked = document.body.classList.contains('dark-theme');
        }
    },

    resetPage: () => {
        console.log("PageSettings: Resetting page...");
        if (PageSettings.profileSettingsForm) UI.resetForm(PageSettings.profileSettingsForm);
        if (PageSettings.changePasswordForm) UI.resetForm(PageSettings.changePasswordForm);
        
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);
        if (PageSettings.settingsPageMessageDiv) UI.hideMessage(PageSettings.settingsPageMessageDiv);
        if (PageSettings.deactivationMessageDiv) UI.hideMessage(PageSettings.deactivationMessageDiv);

        if (PageSettings.avatarPreview) {
            PageSettings.avatarPreview.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';
        }
        // PageSettings.isPageInitialized = false; // Jangan di-reset
    },

    populateSettingsForm: (userData) => {
        if (!userData || !PageSettings.profileSettingsForm) {
            console.warn("PageSettings: Cannot populate form, user data or form element missing.");
            return;
        }

        const nameParts = (userData.nama_lengkap || '').split(' ');
        if (PageSettings.firstNameInput) PageSettings.firstNameInput.value = userData.firstName || nameParts[0] || '';
        if (PageSettings.lastNameInput) PageSettings.lastNameInput.value = userData.lastName || nameParts.slice(1).join(' ') || '';
        if (PageSettings.emailInput) PageSettings.emailInput.value = userData.email || '';
        if (PageSettings.nimInput) PageSettings.nimInput.value = userData.nim || '';
        if (PageSettings.semesterSelect) PageSettings.semesterSelect.value = userData.semester || '';
        if (PageSettings.bioInput) PageSettings.bioInput.value = userData.bio || '';
        if (PageSettings.avatarPreview) {
            PageSettings.avatarPreview.src = userData.avatar || (window.sikmaApp.baseUrl + '/assets/images/default_avatar.png');
            PageSettings.avatarPreview.onerror = () => { PageSettings.avatarPreview.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';};
        }
    },

    handleAvatarPreview: (event) => {
        const file = event.target.files[0];
        if (file && PageSettings.avatarPreview) {
             if (file.size > 5 * 1024 * 1024) { // Maks 5MB
                UI.showMessage(PageSettings.profileUpdateMessageDiv, 'Ukuran file avatar terlalu besar (Maks 5MB).', 'error');
                event.target.value = ""; // Reset file input
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                UI.showMessage(PageSettings.profileUpdateMessageDiv, 'Format file avatar tidak valid (hanya JPG, PNG, GIF).', 'error');
                event.target.value = ""; // Reset file input
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                PageSettings.avatarPreview.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    },

    handleProfileUpdateSubmit: async (e) => {
        e.preventDefault();
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        
        if (!PageSettings.profileSettingsForm.checkValidity()) {
            PageSettings.profileSettingsForm.reportValidity();
            UI.showMessage(PageSettings.profileUpdateMessageDiv, 'Harap isi semua field yang wajib (*).', 'error');
            return;
        }

        const formData = new FormData(PageSettings.profileSettingsForm);
        // Email dan NIM adalah readonly, jadi tidak akan terkirim by default jika disabled.
        // Backend user_handler.php untuk 'update_profile' tidak mengharapkan perubahan email/NIM.
        // Namun, kita perlu mengirim semester.
        formData.append('semester', PageSettings.semesterSelect.value); // Pastikan semester terkirim

        UI.showButtonSpinner(PageSettings.profileSubmitBtn, 'Simpan Perubahan Profil');

        const response = await Api.updateUserProfile(formData);
        UI.hideButtonSpinner(PageSettings.profileSubmitBtn);

        if (response.status === 'success' && response.user) {
            UI.showMessage(PageSettings.profileUpdateMessageDiv, response.message || 'Profil berhasil diperbarui!', 'success');
            
            // Update data pengguna global dan UI bersama
            window.sikmaApp.initialUserData = { ...window.sikmaApp.initialUserData, ...response.user };
            UI.updateSharedUserUI(window.sikmaApp.initialUserData);
            
            // Update juga data di halaman profil jika sudah diinisialisasi
            if (typeof PageProfile !== 'undefined' && PageProfile.isPageInitialized) {
                PageProfile._populateFullProfileForm(window.sikmaApp.initialUserData); // Panggil fungsi populate di PageProfile
            }
            // Cek ulang kelengkapan profil
            window.sikmaApp.needsProfileCompletion = !response.user.is_profile_complete;
            AuthFlow.checkInitialProfileCompletion();

        } else {
            const errorMsg = response.errors ? response.errors : (response.message || 'Gagal memperbarui profil.');
            UI.showMessage(PageSettings.profileUpdateMessageDiv, errorMsg, 'error');
        }
    },

    handleChangePasswordSubmit: async (e) => {
        e.preventDefault();
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);

        if (!PageSettings.changePasswordForm.checkValidity()) {
            PageSettings.changePasswordForm.reportValidity();
            UI.showMessage(PageSettings.passwordChangeMessageDiv, 'Harap isi semua field kata sandi.', 'error');
            return;
        }
        if (PageSettings.newPasswordInput.value !== PageSettings.confirmNewPasswordInput.value) {
            UI.showMessage(PageSettings.passwordChangeMessageDiv, 'Konfirmasi kata sandi baru tidak cocok.', 'error');
            PageSettings.confirmNewPasswordInput.focus();
            return;
        }

        const formData = new FormData(PageSettings.changePasswordForm);
        UI.showButtonSpinner(PageSettings.passwordSubmitBtn, 'Ubah Kata Sandi');

        const response = await Api.changePassword(formData);
        UI.hideButtonSpinner(PageSettings.passwordSubmitBtn);

        if (response.status === 'success') {
            UI.showMessage(PageSettings.passwordChangeMessageDiv, response.message || 'Kata sandi berhasil diubah.', 'success');
            UI.resetForm(PageSettings.changePasswordForm);
            if (PageSettings.newPasswordStrengthIndicator) PageSettings.newPasswordStrengthIndicator.textContent = ''; // Reset strength
        } else {
            const errorMsg = response.errors ? response.errors : (response.message || 'Gagal mengubah kata sandi.');
            UI.showMessage(PageSettings.passwordChangeMessageDiv, errorMsg, 'error');
        }
    },
    
    handleDeactivateAccount: async () => {
        if (PageSettings.deactivationMessageDiv) UI.hideMessage(PageSettings.deactivationMessageDiv);
        
        const password = prompt("Untuk keamanan, masukkan kata sandi Anda saat ini untuk menonaktifkan akun:");
        if (password === null) return; // User cancel prompt

        if (!password) {
            UI.showMessage(PageSettings.deactivationMessageDiv, 'Kata sandi diperlukan untuk menonaktifkan akun.', 'warning');
            return;
        }

        if (!confirm("Apakah Anda YAKIN ingin menonaktifkan akun Anda? Tindakan ini mungkin memerlukan bantuan administrator untuk diaktifkan kembali.")) {
            return;
        }
        
        UI.showButtonSpinner(PageSettings.deactivateAccountBtn, 'Nonaktifkan Akun Saya', 'Memproses...');
        
        // Panggil API untuk deaktivasi (placeholder, backend perlu implementasi)
        const response = await Api.deactivateAccount(password); 
        UI.hideButtonSpinner(PageSettings.deactivateAccountBtn);

        if (response.status === 'success') {
            UI.showMessage(PageSettings.settingsPageMessageDiv, response.message || 'Akun Anda telah dinonaktifkan. Anda akan segera logout.', 'success', 0);
            // Lakukan logout otomatis setelah beberapa detik
            setTimeout(() => {
                if (AuthFlow && typeof AuthFlow.handleLogout === 'function') {
                    AuthFlow.handleLogout();
                }
            }, 4000);
        } else {
            UI.showMessage(PageSettings.deactivationMessageDiv, response.message || 'Gagal menonaktifkan akun.', 'error');
        }
    }
};

// Panggil initialize dasar saat script dimuat jika elemen sudah ada
// document.addEventListener('DOMContentLoaded', PageSettings.initialize);
// Inisialisasi akan dipanggil oleh AppCore.navigateToPage
