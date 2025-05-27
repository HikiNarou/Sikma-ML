<?php
// SikmaV3 - includes/user_handler.php (Perbaikan Login)

// session_utils.php dan db_connect.php sudah di-include oleh auth.php
// config.php juga sudah di-include oleh auth.php atau session_utils.php

// Fungsi validasi input dasar (asumsi sudah ada dari versi sebelumnya)
function validate_input($data, $rules) {
    $errors = [];
    foreach ($rules as $field => $ruleSet) {
        $value = trim($data[$field] ?? '');
        $ruleItems = explode('|', $ruleSet);
        foreach ($ruleItems as $rule) {
            $params = [];
            if (strpos($rule, ':') !== false) {
                list($rule, $paramStr) = explode(':', $rule, 2);
                $params = explode(',', $paramStr);
            }

            switch ($rule) {
                case 'required':
                    if (empty($value) && !is_numeric($value)) { // Allow 0 as a valid numeric input
                        $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " wajib diisi.";
                    }
                    break;
                case 'email':
                    if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field][] = "Format email tidak valid.";
                    }
                    break;
                case 'min_length':
                    if (!empty($value) && strlen($value) < $params[0]) {
                        $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " minimal harus " . $params[0] . " karakter.";
                    }
                    break;
                case 'max_length':
                    if (!empty($value) && strlen($value) > $params[0]) {
                        $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " maksimal " . $params[0] . " karakter.";
                    }
                    break;
                case 'numeric':
                    if (!empty($value) && !is_numeric($value)) {
                        $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " harus berupa angka.";
                    }
                    break;
                case 'matches':
                    if ($value !== trim($data[$params[0]] ?? '')) {
                        $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " tidak cocok dengan " . ucfirst(str_replace('_', ' ', $params[0])) . ".";
                    }
                    break;
                case 'accepted': 
                    if (empty($data[$field]) || $data[$field] !== 'on' && $data[$field] !== '1' && $data[$field] !== true) {
                         $errors[$field][] = "Anda harus menyetujui " . ucfirst(str_replace('_', ' ', $field)) . ".";
                    }
                    break;
            }
        }
    }
    return $errors;
}


function handle_register($pdo) {
    $inputData = $_POST;
    $rules = [
        'nama_lengkap' => 'required|max_length:100',
        'email' => 'required|email|max_length:100',
        'nim' => 'required|numeric|min_length:5|max_length:12',
        'password' => 'required|min_length:6',
        'confirm_password' => 'required|matches:password',
        'semester' => 'required|numeric',
        'terms' => 'accepted'
    ];

    $validation_errors = validate_input($inputData, $rules);
    if (!empty($validation_errors)) {
        return ['status' => 'error', 'message' => 'Data tidak valid.', 'errors' => $validation_errors];
    }

    $nama_lengkap = trim($inputData['nama_lengkap']);
    $email = trim($inputData['email']);
    $nim = trim($inputData['nim']);
    $password = $inputData['password'];
    $semester = (int)$inputData['semester'];

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email OR nim = :nim");
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':nim', $nim, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return ['status' => 'error', 'message' => 'Email atau NIM sudah terdaftar.'];
        }

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $default_avatar = DEFAULT_AVATAR_PLACEHOLDER_URL . strtoupper(substr($nama_lengkap, 0, 1));
        
        // Saat registrasi, semester disimpan. Pastikan tabel users memiliki kolom semester.
        $stmt = $pdo->prepare(
            "INSERT INTO users (nama_lengkap, email, nim, password, avatar, semester, is_profile_complete, created_at, updated_at) 
             VALUES (:nama_lengkap, :email, :nim, :password, :avatar, :semester, 0, NOW(), NOW())"
        );
        $stmt->bindParam(':nama_lengkap', $nama_lengkap, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':nim', $nim, PDO::PARAM_STR);
        $stmt->bindParam(':password', $hashed_password, PDO::PARAM_STR);
        $stmt->bindParam(':avatar', $default_avatar, PDO::PARAM_STR);
        $stmt->bindParam(':semester', $semester, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Registrasi berhasil! Silakan login.'];
        } else {
            return ['status' => 'error', 'message' => 'Registrasi gagal. Kesalahan server.'];
        }
    } catch (PDOException $e) {
        error_log("Database error on register: " . $e->getMessage());
        return ['status' => 'error', 'message' => 'Terjadi kesalahan pada server saat registrasi. Silakan coba lagi nanti.'];
    }
}

function handle_login($pdo) {
    $email_nim = trim($_POST['email_nim'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember_me = isset($_POST['remember_me']);

    if (empty($email_nim) || empty($password)) {
        return ['status' => 'error', 'message' => 'Email/NIM dan Password wajib diisi.'];
    }

    try {
        // PERBAIKAN: Hapus 'semester' dari SELECT jika kolom tersebut TIDAK ADA di tabel 'users'
        // Jika Anda SUDAH menambahkan kolom 'semester' ke tabel 'users', biarkan query ini.
        // Jika BELUM, gunakan query di bawah ini yang tidak menyertakan 'semester'.
        $sql = "SELECT id, nama_lengkap, email, nim, password, avatar, bio, is_profile_complete 
                FROM users WHERE email = :email_nim OR nim = :email_nim";
        
        // Jika Anda YAKIN kolom 'semester' ADA di tabel 'users', gunakan query ini:
        // $sql = "SELECT id, nama_lengkap, email, nim, password, avatar, bio, semester, is_profile_complete 
        //         FROM users WHERE email = :email_nim OR nim = :email_nim";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':email_nim', $email_nim, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($password, $user['password'])) {
                // Jika Anda menggunakan query yang tidak mengambil semester, dan semester ada di DB,
                // Anda mungkin perlu query tambahan di sini untuk mengambil semester jika dibutuhkan segera.
                // Atau, pastikan `startUserSession` bisa menangani jika $user['semester'] tidak ada.
                // Untuk konsistensi, jika semester penting, tambahkan kolomnya ke DB dan ke SELECT utama.
                // Jika 'semester' tidak ada di $user, startUserSession akan set $_SESSION['user_semester'] ke null.
                startUserSession($user);
                
                // Data user yang dikirim ke frontend akan diambil dari session oleh getCurrentUserData()
                // yang dipanggil di handle_check_session atau langsung di AuthFlow.js
                $userDataForFrontend = [
                    'id' => $user['id'],
                    'nama_lengkap' => $user['nama_lengkap'],
                    'email' => $user['email'],
                    'nim' => $user['nim'],
                    'avatar' => $_SESSION['user_avatar'],
                    'bio' => $_SESSION['user_bio'],
                    'semester' => $_SESSION['user_semester'] ?? null, // Ambil dari session, akan null jika tidak ada
                    'is_profile_complete' => (bool)$_SESSION['is_profile_complete']
                ];
                
                return [
                    'status' => 'success',
                    'message' => 'Login berhasil!',
                    'user' => $userDataForFrontend
                ];
            } else {
                return ['status' => 'error', 'message' => 'Email/NIM atau Password salah.'];
            }
        } else {
            return ['status' => 'error', 'message' => 'Email/NIM atau Password salah.'];
        }
    } catch (PDOException $e) {
        error_log("Database error on login: " . $e->getMessage());
        // Jangan tampilkan $e->getMessage() ke pengguna di produksi
        return ['status' => 'error', 'message' => 'Terjadi kesalahan pada server saat login. Silakan coba lagi nanti.'];
    }
}

function handle_logout() {
    destroyUserSession();
    return ['status' => 'success', 'message' => 'Logout berhasil.'];
}

function handle_check_session($pdo) {
    if (userIsLoggedIn()) {
        $userId = $_SESSION['user_id'];
        // Selalu perbarui status kelengkapan profil dari DB saat check session
        // dan juga data semester jika ada perubahan di tempat lain.
        // Untuk semester, jika tidak ada di tabel users, getCurrentUserData akan mengembalikan null.
        // Jika semester ada di tabel users, pastikan getCurrentUserData mengambilnya dari session yang sudah diupdate.
        // Solusi terbaik: pastikan tabel users punya kolom semester dan query login mengambilnya.

        // Ambil data terbaru dari DB untuk semester jika diperlukan
        $stmtUser = $pdo->prepare("SELECT semester, is_profile_complete FROM users WHERE id = :id");
        $stmtUser->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmtUser->execute();
        $dbUserData = $stmtUser->fetch(PDO::FETCH_ASSOC);

        if ($dbUserData) {
             $_SESSION['user_semester'] = $dbUserData['semester'] ?? $_SESSION['user_semester'] ?? null; // Update session semester
             $_SESSION['is_profile_complete'] = (bool)($dbUserData['is_profile_complete'] ?? false); // Update status kelengkapan
        }
        // checkProfileCompleteness($pdo, $userId); // Bisa juga dipanggil di sini untuk memastikan

        return [
            'status' => 'success',
            'loggedIn' => true,
            'user' => getCurrentUserData()
        ];
    } else {
        return ['status' => 'success', 'loggedIn' => false];
    }
}

function handle_update_profile($pdo) {
    requireLogin();
    $userId = $_SESSION['user_id'];
    $inputData = $_POST;
    $fileData = $_FILES;

    $rules = [
        'firstName' => 'required|max_length:50',
        'lastName' => 'required|max_length:50',
        'bio' => 'max_length:1000',
        'semester' => 'required|numeric', // Semester juga diupdate di sini
    ];
    
    $validation_errors = validate_input($inputData, $rules);
    if (!empty($validation_errors)) {
        return ['status' => 'error', 'message' => 'Data tidak valid.', 'errors' => $validation_errors];
    }

    $firstName = trim($inputData['firstName']);
    $lastName = trim($inputData['lastName']);
    $bio = trim($inputData['bio']);
    $nama_lengkap = trim($firstName . " " . $lastName);
    $semester = (int)$inputData['semester'];

    $avatarPathForDB = $_SESSION['user_avatar'];

    if (isset($fileData['avatar']) && $fileData['avatar']['error'] == UPLOAD_ERR_OK) {
        $uploadDirWeb = WEB_AVATARS_PATH; 
        $uploadDirPhysical = PHYSICAL_AVATARS_PATH;

        $fileName = $userId . "_" . time() . "_" . preg_replace("/[^a-zA-Z0-9.]+/", "_", basename($fileData["avatar"]["name"]));
        $targetFilePathPhysical = $uploadDirPhysical . DS . $fileName;
        $fileType = strtolower(pathinfo($targetFilePathPhysical, PATHINFO_EXTENSION));
        $allowTypes = ['jpg', 'png', 'jpeg', 'gif'];
        $maxFileSize = 5 * 1024 * 1024; 

        if (!in_array($fileType, $allowTypes)) {
            return ['status' => 'error', 'message' => "Maaf, hanya file JPG, JPEG, PNG & GIF yang diizinkan."];
        }
        if ($fileData["avatar"]["size"] > $maxFileSize) {
            return ['status' => 'error', 'message' => "Maaf, ukuran file avatar terlalu besar (Maks 5MB)."];
        }

        if (move_uploaded_file($fileData["avatar"]["tmp_name"], $targetFilePathPhysical)) {
            $oldAvatarWebPath = $_SESSION['user_avatar'];
            if ($oldAvatarWebPath && strpos($oldAvatarWebPath, 'placehold.co') === false) {
                $oldAvatarPhysicalPath = str_replace(APP_BASE_URL, ROOT_PATH, $oldAvatarWebPath);
                 if (file_exists($oldAvatarPhysicalPath) && $oldAvatarPhysicalPath !== $targetFilePathPhysical) {
                    @unlink($oldAvatarPhysicalPath);
                }
            }
            $avatarPathForDB = $uploadDirWeb . '/' . $fileName;
        } else {
            error_log("Gagal memindahkan file avatar yang diupload: " . $fileData['avatar']['error']);
            return ['status' => 'error', 'message' => "Maaf, terjadi kesalahan saat mengupload file avatar Anda."];
        }
    } elseif (isset($fileData['avatar']) && $fileData['avatar']['error'] != UPLOAD_ERR_NO_FILE) {
         return ['status' => 'error', 'message' => "Terjadi masalah dengan file avatar yang diupload. Kode Error: " . $fileData['avatar']['error']];
    }

    try {
        // Pastikan tabel users memiliki kolom semester
        $stmt = $pdo->prepare(
            "UPDATE users SET nama_lengkap = :nama_lengkap, bio = :bio, avatar = :avatar, semester = :semester, updated_at = NOW() 
             WHERE id = :id"
        );
        $stmt->bindParam(':nama_lengkap', $nama_lengkap, PDO::PARAM_STR);
        $stmt->bindParam(':bio', $bio, PDO::PARAM_STR);
        $stmt->bindParam(':avatar', $avatarPathForDB, PDO::PARAM_STR);
        $stmt->bindParam(':semester', $semester, PDO::PARAM_INT);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $_SESSION['user_nama_lengkap'] = $nama_lengkap;
            $_SESSION['user_bio'] = $bio;
            $_SESSION['user_avatar'] = $avatarPathForDB;
            $_SESSION['user_semester'] = $semester; // Update session semester
            
            $isProfileComplete = checkProfileCompleteness($pdo, $userId);
            $_SESSION['is_profile_complete'] = $isProfileComplete; // Pastikan session terupdate

            return [
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui!',
                'user' => getCurrentUserData() 
            ];
        } else {
            return ['status' => 'error', 'message' => 'Gagal memperbarui profil di database.'];
        }
    } catch (PDOException $e) {
        error_log("Database error on update_profile: " . $e->getMessage());
        return ['status' => 'error', 'message' => 'Terjadi kesalahan server saat memperbarui profil.'];
    }
}


function handle_change_password($pdo) {
    requireLogin();
    $userId = $_SESSION['user_id'];
    $inputData = $_POST;

    $rules = [
        'currentPassword' => 'required',
        'newPassword' => 'required|min_length:6',
        'confirmNewPassword' => 'required|matches:newPassword'
    ];
    $validation_errors = validate_input($inputData, $rules);
    if (!empty($validation_errors)) {
        return ['status' => 'error', 'message' => 'Data tidak valid.', 'errors' => $validation_errors];
    }

    $currentPassword = $inputData['currentPassword'];
    $newPassword = $inputData['newPassword'];

    try {
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($currentPassword, $user['password'])) {
            $hashed_new_password = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE users SET password = :password, updated_at = NOW() WHERE id = :id");
            $updateStmt->bindParam(':password', $hashed_new_password, PDO::PARAM_STR);
            $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);

            if ($updateStmt->execute()) {
                return ['status' => 'success', 'message' => 'Kata sandi berhasil diubah.'];
            } else {
                return ['status' => 'error', 'message' => 'Gagal mengubah kata sandi di database.'];
            }
        } else {
            return ['status' => 'error', 'message' => 'Kata sandi saat ini salah.'];
        }
    } catch (PDOException $e) {
        error_log("Database error on change_password: " . $e->getMessage());
        return ['status' => 'error', 'message' => 'Terjadi kesalahan server saat mengubah kata sandi.'];
    }
}

function handle_forgot_password($pdo) {
    $email = trim($_POST['email'] ?? '');
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['status' => 'error', 'message' => 'Format email tidak valid.'];
    }
    // Logika Lupa Password (placeholder, perlu implementasi pengiriman email dan token)
    // Cek apakah email ada
    // $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    // $stmt->bindParam(':email', $email);
    // $stmt->execute();
    // if ($stmt->fetch()) {
    //     // Generate token, simpan, kirim email
    //     return ['status' => 'success', 'message' => 'Jika email terdaftar, instruksi reset password telah dikirim.'];
    // } else {
    //     return ['status' => 'error', 'message' => 'Email tidak ditemukan.'];
    // }
    return ['status' => 'info', 'message' => 'Fitur "Lupa Password" sedang dalam pengembangan. Jika email Anda terdaftar, Anda akan menerima instruksi (simulasi).'];
}

?>
    