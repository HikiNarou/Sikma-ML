<?php
// SikmaV3 - index.php (Diperbarui Total)

// Pastikan config.php di-include pertama untuk konstanta global
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/session_utils.php'; // Mengurus session_start() dan utilitas sesi
require_once __DIR__ . '/includes/db_connect.php';   // Dibutuhkan untuk checkProfileCompleteness

$isLoggedIn = userIsLoggedIn();
$initialUserData = null;
$needsProfileCompletion = false;
$activeTheme = 'light-theme'; // Default theme

if ($isLoggedIn) {
    $initialUserData = getCurrentUserData(); // Mengambil data user dari session
    // Cek ulang status kelengkapan profil
    if (!checkProfileCompleteness($pdo, $_SESSION['user_id'])) {
        $needsProfileCompletion = true;
        // Pastikan session flag juga terupdate
        if ($initialUserData) $initialUserData['is_profile_complete'] = false; 
        $_SESSION['is_profile_complete'] = false;
    } else {
        if ($initialUserData) $initialUserData['is_profile_complete'] = true;
        $_SESSION['is_profile_complete'] = true;
    }
    // Ambil tema dari cookie jika ada
    if (isset($_COOKIE['theme']) && ($_COOKIE['theme'] === 'dark-theme' || $_COOKIE['theme'] === 'light-theme')) {
        $activeTheme = $_COOKIE['theme'];
    }
} else {
    // Jika tidak login, mungkin ada cookie tema dari sesi sebelumnya, bisa diabaikan atau dibersihkan
    // Untuk saat ini, kita set default jika tidak login
    $activeTheme = 'light-theme';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo APP_NAME; ?> <?php echo $isLoggedIn && !$needsProfileCompletion ? '- Dashboard' : ($needsProfileCompletion ? '- Lengkapi Profil' : '- Login'); ?></title>
    
    <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/auth_forms.css">
    <link rel="stylesheet" href="assets/css/sidebar.css">
    <link rel="stylesheet" href="assets/css/header.css">
    <link rel="stylesheet" href="assets/css/modals.css">
    
    <link rel="stylesheet" href="assets/css/home.css">
    <link rel="stylesheet" href="assets/css/profile_page.css">
    <link rel="stylesheet" href="assets/css/settings_page.css">
    <link rel="stylesheet" href="assets/css/company_detail.css">

    <link rel="icon" href="assets/images/sikma-logo-favicon.png" type="image/png">

</head>
<body class="<?php echo $activeTheme; ?>">

    <div class="auth-container" id="authContainer" style="<?php echo $isLoggedIn ? 'display: none;' : 'display: flex;'; ?>">
        <div class="auth-form-wrapper">
            <div class="logo-auth">
                <img src="assets/images/sikma-logo-main.png" alt="Logo SIKMA">
            </div>
            <form id="loginForm" style="display: block;">
                <h1>Selamat Datang!</h1>
                <p class="subtitle">Silakan login untuk melanjutkan ke <?php echo APP_NAME; ?>.</p>
                <div id="loginMessage" class="auth-message" style="display:none;"></div>
                <div class="form-group">
                    <label for="login_email_nim">Email atau NIM</label>
                    <input type="text" id="login_email_nim" name="email_nim" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label for="login_password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="login_password" name="password" required autocomplete="current-password">
                        <i class="fas fa-eye-slash toggle-password" data-target="login_password"></i>
                    </div>
                </div>
                <div class="form-group form-inline-group">
                    <label class="checkbox-container">
                        <input type="checkbox" name="remember_me" id="remember_me">
                        <span class="checkmark"></span>
                        Ingat Saya
                    </label>
                    <a href="#" id="forgotPasswordLink" class="forgot-password-link">Lupa Password?</a>
                </div>
                <button type="submit" class="btn-auth">Login</button>
                <p class="switch-form-link">Belum punya akun? <a href="#" id="switchToRegister">Daftar di sini</a></p>
            </form>
            <form id="registerForm" style="display: none;">
                <h1>Buat Akun Baru</h1>
                <p class="subtitle">Isi data diri Anda untuk mendaftar.</p>
                <div id="registerMessage" class="auth-message" style="display:none;"></div>
                <div class="form-group">
                    <label for="register_nama_lengkap">Nama Lengkap</label>
                    <input type="text" id="register_nama_lengkap" name="nama_lengkap" required>
                </div>
                <div class="form-group">
                    <label for="register_email">Email</label>
                    <input type="email" id="register_email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="register_nim">NIM (Nomor Induk Mahasiswa)</label>
                    <input type="text" id="register_nim" name="nim" required pattern="\d{5,12}" title="NIM harus berupa 5-12 digit angka.">
                </div>
                <div class="form-group">
                    <label for="register_semester">Semester Saat Ini</label>
                    <select id="register_semester" name="semester" required>
                        <option value="">Pilih Semester</option>
                        <?php for ($i = 1; $i <= 10; $i++): // Semester biasanya 1-8, bisa disesuaikan ?>
                            <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                        <?php endfor; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="register_password">Password</label>
                     <div class="password-wrapper">
                        <input type="password" id="register_password" name="password" required minlength="6">
                        <i class="fas fa-eye-slash toggle-password" data-target="register_password"></i>
                    </div>
                    <small class="password-strength-indicator" id="register_password_strength"></small>
                </div>
                <div class="form-group">
                    <label for="register_confirm_password">Konfirmasi Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="register_confirm_password" name="confirm_password" required>
                         <i class="fas fa-eye-slash toggle-password" data-target="register_confirm_password"></i>
                    </div>
                </div>
                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" name="terms" id="register_terms" required>
                        <span class="checkmark"></span>
                        Saya menyetujui <a href="/terms" target="_blank">Syarat & Ketentuan</a> yang berlaku.
                    </label>
                </div>
                <button type="submit" class="btn-auth">Daftar</button>
                <p class="switch-form-link">Sudah punya akun? <a href="#" id="switchToLogin">Login di sini</a></p>
            </form>
        </div>
    </div>

    <div class="app-container" id="appContainer" style="<?php echo $isLoggedIn ? 'display: flex;' : 'display: none;'; ?>">
        <aside class="sidebar" id="pageSidebar">
            <button class="sidebar-toggle" id="sidebarToggleBtn" aria-label="Toggle Sidebar">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="logo">
                <img src="assets/images/sikma-logo-sidebar.png" alt="Logo SIKMA Alternatif">
            </div>
            <nav class="navigation">
                <ul>
                    <li id="nav-home"><a href="#" data-page="page-home" class="active-link"><i class="fas fa-home icon"></i><span class="nav-text">Utama</span></a></li>
                    <li id="nav-profile"><a href="#" data-page="page-profile"><i class="fas fa-user-edit icon"></i><span class="nav-text">Profil Data</span></a></li>
                    <li id="nav-settings"><a href="#" data-page="page-settings"><i class="fas fa-cog icon"></i><span class="nav-text">Setelan</span></a></li>
                    <li id="nav-logout-li"><a href="#" id="nav-logout" class="logout-link"><i class="fas fa-sign-out-alt icon"></i><span class="nav-text">Logout</span></a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content-wrapper" id="mainContentWrapper">
            <header class="header" id="pageHeader">
                <div class="user-profile">
                    <img src="<?php echo htmlspecialchars($initialUserData['avatar'] ?? DEFAULT_AVATAR_PLACEHOLDER_URL . 'U'); ?>" alt="Foto Profil" class="avatar" id="sharedAvatarPreview">
                    <span id="sharedUserName"><?php echo htmlspecialchars($initialUserData['nama_lengkap'] ?? 'Nama Mahasiswa'); ?></span>
                </div>
                <div class="header-actions">
                    <div class="notification-icon" id="notificationBtn" title="Notifikasi (Belum aktif)">
                        <i class="fas fa-bell"></i>
                        </div>
                    <div class="search-bar">
                        <input type="text" id="mainSearchInput" placeholder="Cari perusahaan...">
                        <button class="search-button" id="mainSearchButton" aria-label="Cari"><i class="fas fa-search"></i></button>
                    </div>
                     <label class="theme-switch-label" for="darkModeToggleHeader" title="Ganti Tema">
                        <input type="checkbox" id="darkModeToggleHeader" class="theme-switch-checkbox" <?php echo $activeTheme === 'dark-theme' ? 'checked' : ''; ?>>
                        <span class="theme-switch-slider">
                            <i class="fas fa-sun sun-icon"></i>
                            <i class="fas fa-moon moon-icon"></i>
                        </span>
                    </label>
                </div>
            </header>

            <main id="page-home" class="page-content active">
                <?php include __DIR__ . '/pages/home_content.php'; ?>
            </main>
            <main id="page-profile" class="page-content">
                <?php include __DIR__ . '/pages/profile_content.php'; ?>
            </main>
            <main id="page-settings" class="page-content">
                <?php include __DIR__ . '/pages/settings_content.php'; ?>
            </main>
            <main id="page-company-detail" class="page-content">
                <?php include __DIR__ . '/pages/company_detail_content.php'; ?>
            </main>

            <div id="profileCompletionOverlay" class="profile-completion-overlay" style="display: <?php echo $isLoggedIn && $needsProfileCompletion ? 'flex' : 'none'; ?>;">
                <div class="profile-completion-content">
                    <h2>Lengkapi Profil Anda</h2>
                    <p>Untuk melanjutkan dan mendapatkan rekomendasi terbaik, harap lengkapi data profil Anda terlebih dahulu.</p>
                    <div id="profileCompletionMessage" class="auth-message" style="display:none;"></div>
                    <button id="goToProfileCompletionBtn" class="btn btn-primary" style="margin-top:15px;">Lengkapi Profil Sekarang</button>
                </div>
            </div>
        </div>
    </div>

    <div id="itemEntryModal" class="modal item-entry-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="itemModalTitle"><i class="fas fa-plus-square"></i>Tambah Item</h3>
                <button type="button" class="close-btn" aria-label="Tutup Modal" data-modal-id="itemEntryModal">&times;</button>
            </div>
            <form id="itemEntryForm" novalidate>
                <input type="hidden" id="itemType" name="itemType">
                <input type="hidden" id="itemId" name="itemId"> 
                
                <div id="modalSpecificFieldsContainer">
                    </div>
                
                <div id="itemModalMessage" class="auth-message" style="display:none;"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary close-btn-footer" data-modal-id="itemEntryModal">Batal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-check-circle"></i>Simpan Item</button>
                </div>
            </form>
        </div>
    </div>

    <div style="display:none;" id="modalTemplatesContainer">
        <div id="skillFieldsTemplate" class="modal-fields-group"> <div class="form-group">
                <label for="modal_item_generic_name">Nama Item:</label> <input type="text" id="modal_item_generic_name" name="item_generic_name" required> </div>
            <div class="form-group">
                <label for="modal_skill_level">Tingkat Keahlian:</label>
                <select id="modal_skill_level" name="skill_level" required>
                    <option value="">Pilih Tingkat</option>
                    <option value="Dasar">Dasar</option>
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Mahir">Mahir</option>
                    <option value="Ahli">Ahli</option>
                </select>
            </div>
            <div class="form-group">
                <label for="modal_experience_duration">Lama Pengalaman/Menekuni:</label>
                <input type="text" id="modal_experience_duration" name="experience_duration" placeholder="cth: 1 tahun, 6 bulan, 2 proyek">
            </div>
        </div>

        <div id="educationFieldsTemplate" class="modal-fields-group">
            <div class="form-group">
                <label for="modal_institution_name">Nama Institusi:</label>
                <input type="text" id="modal_institution_name" name="institution_name" required>
            </div>
            <div class="form-group">
                <label for="modal_degree">Gelar/Jenjang:</label>
                <input type="text" id="modal_degree" name="degree" placeholder="cth: S1, D3, SMA/SMK">
            </div>
            <div class="form-group">
                <label for="modal_field_of_study">Bidang Studi:</label>
                <input type="text" id="modal_field_of_study" name="field_of_study" placeholder="cth: Teknik Informatika">
            </div>
             <div class="form-row">
                <div class="form-group">
                    <label for="modal_education_start_date">Tanggal Mulai:</label>
                    <input type="month" id="modal_education_start_date" name="start_date">
                </div>
                <div class="form-group">
                    <label for="modal_education_end_date">Tanggal Selesai (atau perkiraan):</label>
                    <input type="month" id="modal_education_end_date" name="end_date">
                </div>
            </div>
            <div class="form-group">
                <label for="modal_education_description">Deskripsi Tambahan (Opsional):</label>
                <textarea id="modal_education_description" name="description" rows="3"></textarea>
            </div>
        </div>

         <div id="experienceFieldsTemplate" class="modal-fields-group">
            <div class="form-group">
                <label for="modal_company_name">Nama Perusahaan/Organisasi:</label>
                <input type="text" id="modal_company_name" name="company_name" required>
            </div>
            <div class="form-group">
                <label for="modal_job_title">Posisi/Jabatan:</label>
                <input type="text" id="modal_job_title" name="job_title" placeholder="cth: Web Developer Intern" required>
            </div>
             <div class="form-row">
                <div class="form-group">
                    <label for="modal_experience_start_date">Tanggal Mulai:</label>
                    <input type="month" id="modal_experience_start_date" name="start_date">
                </div>
                <div class="form-group">
                    <label for="modal_experience_end_date">Tanggal Selesai (kosong jika masih berlangsung):</label>
                    <input type="month" id="modal_experience_end_date" name="end_date">
                </div>
            </div>
            <div class="form-group">
                <label for="modal_experience_description">Deskripsi Pekerjaan/Proyek (Opsional):</label>
                <textarea id="modal_experience_description" name="description" rows="4"></textarea>
            </div>
        </div>

        <div id="socialLinkFieldsTemplate" class="modal-fields-group">
            <div class="form-group">
                <label for="modal_platform_name">Platform:</label>
                 <select id="modal_platform_name" name="platform_name" required>
                    <option value="">Pilih Platform</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="GitHub">GitHub</option>
                    <option value="GitLab">GitLab</option>
                    <option value="Portfolio Website">Portfolio Website</option>
                    <option value="Behance">Behance</option>
                    <option value="Dribbble">Dribbble</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            <div class="form-group">
                <label for="modal_url">URL Profil/Link:</label>
                <input type="url" id="modal_url" name="url" placeholder="https://..." required>
            </div>
        </div>

        <div id="industryPreferenceFieldsTemplate" class="modal-fields-group">
            <div class="form-group">
                <label for="modal_industry_name">Nama Bidang Industri:</label>
                <input type="text" id="modal_industry_name" name="industry_name" placeholder="cth: Fintech, E-commerce, Edukasi" required>
            </div>
             <small>Anda bisa menambahkan beberapa preferensi satu per satu.</small>
        </div>
    </div>
    <script>
        // Data awal dari PHP untuk JavaScript
        window.sikmaApp = {
            isUserLoggedIn: <?php echo json_encode($isLoggedIn); ?>,
            initialUserData: <?php echo json_encode($initialUserData); ?>,
            needsProfileCompletion: <?php echo json_encode($needsProfileCompletion); ?>,
            baseUrl: "<?php echo rtrim(APP_BASE_URL, '/'); ?>", // Pastikan tidak ada trailing slash
            appName: "<?php echo APP_NAME; ?>",
            // csrfToken: "<?php // echo $_SESSION['csrf_token'] ?? ''; ?>" // Jika menggunakan CSRF token
        };
    </script>

    <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>

    <script src="assets/js/ui.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/auth_flow.js"></script>
    <script src="assets/js/app_core.js"></script>
    
    <script src="assets/js/page_home.js"></script>
    <script src="assets/js/page_profile.js"></script>
    <script src="assets/js/page_settings.js"></script>
    <script src="assets/js/page_company_detail.js"></script>
    
    <script>
        // Inisialisasi aplikasi utama setelah semua script dimuat
        document.addEventListener('DOMContentLoaded', () => {
            // Inisialisasi dark mode toggle di header (jika belum dihandle AppCore secara spesifik untuk header)
            const headerToggle = document.getElementById('darkModeToggleHeader');
            if (headerToggle && typeof AppCore !== 'undefined' && typeof AppCore._applyTheme === 'function') {
                 headerToggle.addEventListener('change', function() {
                    AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
                });
            }


            if (window.sikmaApp.isUserLoggedIn) {
                AppCore.initializeMainApp(); 
                AuthFlow.checkInitialProfileCompletion(); 
            } else {
                AuthFlow.initializeAuthForms();
            }

            // Password toggle visibility
            document.querySelectorAll('.toggle-password').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const targetId = this.dataset.target;
                    const passwordInput = document.getElementById(targetId);
                    if (passwordInput) {
                        if (passwordInput.type === 'password') {
                            passwordInput.type = 'text';
                            this.classList.remove('fa-eye-slash');
                            this.classList.add('fa-eye');
                        } else {
                            passwordInput.type = 'password';
                            this.classList.remove('fa-eye');
                            this.classList.add('fa-eye-slash');
                        }
                    }
                });
            });
            // Password strength indicator (sederhana)
            const regPassInput = document.getElementById('register_password');
            const strengthIndicator = document.getElementById('register_password_strength');
            if (regPassInput && strengthIndicator && typeof AppCore !== 'undefined') {
                regPassInput.addEventListener('input', function() {
                    AppCore.updatePasswordStrengthIndicator(this, strengthIndicator);
                });
            }

            // Tombol "Lengkapi Profil Sekarang" di overlay
            const goToProfileBtn = document.getElementById('goToProfileCompletionBtn');
            if (goToProfileBtn) {
                goToProfileBtn.addEventListener('click', () => {
                    if (typeof AppCore !== 'undefined' && typeof AppCore.navigateToPage === 'function') {
                        AppCore.navigateToPage('page-profile', document.querySelector('a[data-page="page-profile"]'), 'Lengkapi Profil');
                        if (typeof AuthFlow !== 'undefined' && AuthFlow.profileCompletionOverlay) {
                            UI.hideElement(AuthFlow.profileCompletionOverlay);
                            document.body.style.overflow = ''; 
                        }
                    }
                });
            }
        });
    </script>
</body>
</html>
