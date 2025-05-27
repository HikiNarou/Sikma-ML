<?php
// SikmaV3 - includes/config.php

// Pengaturan Aplikasi Dasar
define('APP_NAME', 'SIKMA Terintegrasi');
define('APP_BASE_URL', dirname($_SERVER['SCRIPT_NAME']) === '/' ? '' : dirname($_SERVER['SCRIPT_NAME'])); // Otomatis mendeteksi base URL

// Pengaturan Database (sudah ada di db_connect.php, tapi bisa dipusatkan di sini jika mau)
// Untuk saat ini, kita biarkan di db_connect.php agar tidak mengubah struktur yang sudah ada secara drastis
// define('DB_SERVER', 'localhost');
// define('DB_USERNAME', 'root');
// define('DB_PASSWORD', '');
// define('DB_NAME', 'sikma_dbv3');

// Pengaturan Path Upload
define('DS', DIRECTORY_SEPARATOR); // Pemisah direktori
define('ROOT_PATH', dirname(__DIR__)); // Path ke direktori utama aplikasi (SikmaV3)
define('UPLOADS_DIR_NAME', 'uploads');
define('AVATARS_DIR_NAME', 'avatars');

define('PHYSICAL_UPLOADS_PATH', ROOT_PATH . DS . UPLOADS_DIR_NAME);
define('PHYSICAL_AVATARS_PATH', PHYSICAL_UPLOADS_PATH . DS . AVATARS_DIR_NAME);

define('WEB_UPLOADS_PATH', APP_BASE_URL . '/' . UPLOADS_DIR_NAME);
define('WEB_AVATARS_PATH', WEB_UPLOADS_PATH . '/' . AVATARS_DIR_NAME);

// Pengaturan Email (jika ada fitur yang memerlukan pengiriman email, misal Lupa Password)
// define('ADMIN_EMAIL', 'admin@example.com');
// define('SMTP_HOST', 'smtp.example.com');
// define('SMTP_USER', 'user@example.com');
// define('SMTP_PASS', 'password');
// define('SMTP_PORT', 587);

// Pengaturan Lainnya
define('DEFAULT_AVATAR_PLACEHOLDER_URL', 'https://placehold.co/80x80/3498db/ffffff?text='); // Tambahkan inisial nama

// Validasi dan pembuatan direktori upload jika belum ada
if (!is_dir(PHYSICAL_AVATARS_PATH)) {
    if (!mkdir(PHYSICAL_AVATARS_PATH, 0775, true)) {
        // Error handling jika gagal membuat direktori, bisa di-log atau throw exception
        // Untuk saat ini, kita biarkan, tapi di aplikasi produksi ini harus ditangani
        error_log("PENTING: Gagal membuat direktori upload avatar di: " . PHYSICAL_AVATARS_PATH);
    }
}

?>
