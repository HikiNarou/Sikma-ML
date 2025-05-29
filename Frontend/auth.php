<?php
// SikmaV3 - auth.php (Router Utama Backend)

// Selalu mulai session dan set header JSON
if (session_status() == PHP_SESSION_NONE) {
    // Pengaturan cookie session dipindahkan ke session_utils.php
    // agar konsisten saat session_start() dipanggil.
    // session_start() akan dipanggil oleh session_utils.php jika belum.
}
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff'); // Mencegah MIME-sniffing
// header("Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';"); // Kebijakan Keamanan Konten Dasar

// Error reporting untuk development, matikan di produksi
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);


require_once __DIR__ . '/includes/config.php'; // Path fisik dari auth.php ke config.php
require_once __DIR__ . '/includes/db_connect.php';   // $pdo akan tersedia
require_once __DIR__ . '/includes/session_utils.php';
require_once __DIR__ . '/includes/user_handler.php';
require_once __DIR__ . '/includes/company_handler.php';
require_once __DIR__ . '/includes/profile_data_handler.php';

// Ambil action dari POST atau GET
$action = $_POST['action'] ?? $_GET['action'] ?? '';
$response = ['status' => 'error', 'message' => 'Aksi tidak valid atau tidak diberikan.'];

// Basic CSRF check (sangat sederhana, perlu token yang lebih kuat di aplikasi produksi)
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//     if (!isset($_SESSION['csrf_token']) || !isset($_POST['csrf_token']) || $_SESSION['csrf_token'] !== $_POST['csrf_token']) {
//         // $response = ['status' => 'error', 'message' => 'Permintaan tidak valid (CSRF token mismatch).'];
//         // echo json_encode($response);
//         // exit;
//     }
// }
// // Regenerate CSRF token after use or periodically
// // $_SESSION['csrf_token'] = bin2hex(random_bytes(32));


switch ($action) {
    // User Authentication & Management
    case 'register':
        $response = handle_register($pdo);
        break;
    case 'login':
        $response = handle_login($pdo);
        break;
    case 'logout':
        $response = handle_logout();
        break;
    case 'check_session':
        $response = handle_check_session($pdo);
        break;
    case 'update_profile': // Untuk update dasar (nama, bio, avatar) dari settings
        $response = handle_update_profile($pdo);
        break;
    case 'change_password':
        $response = handle_change_password($pdo);
        break;
    case 'forgot_password': // Placeholder
        $response = handle_forgot_password($pdo);
        break;

    // Profile Data (skills, experience, etc.)
    case 'save_full_profile': // Untuk menyimpan semua data dari halaman "Lengkapi Profil"
        $response = handle_save_full_profile($pdo);
        break;
    case 'get_profile_data': // Untuk mengambil data profil lengkap untuk ditampilkan di halaman profil
        $response = handle_get_profile_data($pdo);
        break;

    // Company Data
    case 'get_company_details':
        $response = handle_get_company_details($pdo);
        break;
    case 'get_company_list': // Aksi baru untuk mengambil daftar perusahaan
        $response = handle_get_company_list($pdo);
        break;
    
    default:
        // $response tetap default error message
        // Bisa juga mencatat percobaan aksi yang tidak dikenal
        error_log("Aksi tidak dikenal diterima: " . htmlspecialchars($action));
}

// Pastikan tidak ada output lain sebelum json_encode
ob_start(); // Mulai output buffering jika ada output yang tidak diinginkan
echo json_encode($response);
ob_end_flush(); // Kirim output buffer dan matikan
exit;
?>
