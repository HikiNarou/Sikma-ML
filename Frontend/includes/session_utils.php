<?php
// SikmaV3 - includes/session_utils.php

if (session_status() == PHP_SESSION_NONE) {
    // Tambahkan pengaturan cookie session untuk keamanan
    session_set_cookie_params([
        'lifetime' => 0, // Cookie berlaku hingga browser ditutup
        'path' => '/',
        'domain' => $_SERVER['HTTP_HOST'],
        'secure' => isset($_SERVER['HTTPS']), // Hanya kirim cookie melalui HTTPS jika koneksi aman
        'httponly' => true, // Cookie tidak dapat diakses oleh JavaScript
        'samesite' => 'Lax' // Perlindungan dasar terhadap CSRF
    ]);
    session_start();
}

// Sertakan file konfigurasi
require_once __DIR__ . '/config.php';

function userIsLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['login_token']); // Tambahkan pengecekan login_token
}

function requireLogin() {
    if (!userIsLoggedIn()) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Anda harus login.', 'action' => 'logout_required']);
        exit;
    }
    // Validasi login token sederhana untuk mencegah session fixation (opsional, bisa diperkuat)
    if ($_SESSION['login_token'] !== hash('sha256', session_id() . ($_SESSION['user_agent'] ?? ''))) {
        destroyUserSession();
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Sesi tidak valid. Silakan login kembali.', 'action' => 'logout_required']);
        exit;
    }
}

function startUserSession($user) {
    // Regenerasi ID session untuk mencegah session fixation
    if (session_status() == PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nama_lengkap'] = $user['nama_lengkap'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_nim'] = $user['nim'];
    $_SESSION['user_avatar'] = $user['avatar'] ?: DEFAULT_AVATAR_PLACEHOLDER_URL . strtoupper(substr($user['nama_lengkap'],0,1));
    $_SESSION['user_bio'] = $user['bio'] ?? '';
    $_SESSION['user_semester'] = $user['semester'] ?? null; // Tambahkan semester
    // is_profile_complete akan di-set oleh checkProfileCompleteness atau dari DB saat login
    $_SESSION['is_profile_complete'] = isset($user['is_profile_complete']) ? (bool)$user['is_profile_complete'] : false;
    
    // Simpan User Agent untuk validasi token sederhana
    $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
    // Buat login token sederhana
    $_SESSION['login_token'] = hash('sha256', session_id() . $_SESSION['user_agent']);
}

function destroyUserSession() {
    $_SESSION = array(); // Hapus semua variabel session

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    if (session_status() == PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

function getCurrentUserData() {
    if (!userIsLoggedIn()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'nama_lengkap' => $_SESSION['user_nama_lengkap'],
        'email' => $_SESSION['user_email'],
        'nim' => $_SESSION['user_nim'],
        'avatar' => $_SESSION['user_avatar'],
        'bio' => $_SESSION['user_bio'] ?? '',
        'semester' => $_SESSION['user_semester'] ?? null,
        'is_profile_complete' => $_SESSION['is_profile_complete'] ?? false
    ];
}

function checkProfileCompleteness($pdo, $userId) {
    // Definisi "profil lengkap" yang diperbarui:
    // Minimal bio, semester, ipk, kota_asal, kecamatan, kelurahan terisi
    // DAN (ada minimal 1 programmingSkill ATAU 1 framework ATAU 1 otherSkill ATAU 1 education ATAU 1 experience ATAU 1 tool ATAU 1 preferensi_industri)
    try {
        $userStmt = $pdo->prepare("SELECT bio, semester, ipk, kota_asal, kecamatan, kelurahan FROM users WHERE id = :id");
        $userStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $userStmt->execute();
        $userData = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$userData) {
            $_SESSION['is_profile_complete'] = false;
            return false;
        }

        $basicInfoComplete = !empty(trim($userData['bio'] ?? '')) &&
                             !empty($userData['semester']) &&
                             !empty($userData['ipk']) && // Asumsi IPK 0.00 tidak valid atau ada validasi lain
                             !empty(trim($userData['kota_asal'] ?? '')) &&
                             !empty(trim($userData['kecamatan'] ?? '')) &&
                             !empty(trim($userData['kelurahan'] ?? ''));

        if (!$basicInfoComplete) {
            $_SESSION['is_profile_complete'] = false;
            // Tidak perlu update DB di sini jika hanya basic info yang kurang, biarkan save_full_profile yang mengupdate
            return false;
        }

        // Cek apakah ada minimal satu item di tabel-tabel detail profil
        $hasProgrammingSkill = $pdo->query("SELECT 1 FROM user_programming_skills WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasFramework = $pdo->query("SELECT 1 FROM user_frameworks WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasOtherSkill = $pdo->query("SELECT 1 FROM user_other_skills WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasEducation = $pdo->query("SELECT 1 FROM user_education_history WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasExperience = $pdo->query("SELECT 1 FROM user_work_experience WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasSocialLink = $pdo->query("SELECT 1 FROM user_social_links WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasTool = $pdo->query("SELECT 1 FROM user_tools WHERE user_id = $userId LIMIT 1")->fetchColumn(); // Tabel baru
        $hasIndustryPreference = $pdo->query("SELECT 1 FROM user_industry_preferences WHERE user_id = $userId LIMIT 1")->fetchColumn(); // Tabel baru


        $detailedInfoComplete = $hasProgrammingSkill || $hasFramework || $hasOtherSkill || $hasEducation || $hasExperience || $hasSocialLink || $hasTool || $hasIndustryPreference;

        $isComplete = $basicInfoComplete && $detailedInfoComplete;

        $_SESSION['is_profile_complete'] = $isComplete;
        
        // Update kolom is_profile_complete di tabel users
        $updateStmt = $pdo->prepare("UPDATE users SET is_profile_complete = :is_complete WHERE id = :id");
        $updateStmt->bindValue(':is_complete', $isComplete ? 1 : 0, PDO::PARAM_INT);
        $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $updateStmt->execute();
        
        return $isComplete;

    } catch (PDOException $e) {
        error_log("Error checking profile completeness for user $userId: " . $e->getMessage());
        $_SESSION['is_profile_complete'] = false; // Anggap tidak lengkap jika ada error
        return false; 
    }
}
?>
