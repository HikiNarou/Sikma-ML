<?php
// SikmaV3 - includes/profile_data_handler.php

// config.php, db_connect.php, session_utils.php sudah di-include oleh auth.php

function handle_get_profile_data($pdo) {
    requireLogin();
    $userId = $_SESSION['user_id'];
    $response = ['status' => 'error', 'message' => 'Gagal mengambil data profil.'];

    try {
        $profileData = [];
        // Ambil field baru dari tabel users
        $stmt = $pdo->prepare(
            "SELECT id, nama_lengkap, email, nim, avatar, bio, semester, ipk, kota_asal, kecamatan, kelurahan, is_profile_complete 
             FROM users WHERE id = :user_id"
        );
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userData) {
            return ['status' => 'error', 'message' => 'Data pengguna tidak ditemukan.'];
        }

        $nameParts = explode(' ', $userData['nama_lengkap'] ?? '', 2);
        $profileData['id'] = $userData['id'];
        $profileData['firstName'] = $nameParts[0] ?? '';
        $profileData['lastName'] = $nameParts[1] ?? '';
        $profileData['nama_lengkap'] = $userData['nama_lengkap'];
        $profileData['email'] = $userData['email'];
        $profileData['nim'] = $userData['nim'];
        $profileData['avatar'] = $userData['avatar'];
        $profileData['bio'] = $userData['bio'];
        $profileData['semester'] = $userData['semester'];
        $profileData['ipk'] = $userData['ipk'];
        $profileData['kota_asal'] = $userData['kota_asal'];
        $profileData['kecamatan'] = $userData['kecamatan'];
        $profileData['kelurahan'] = $userData['kelurahan'];
        $profileData['is_profile_complete'] = (bool)$userData['is_profile_complete'];

        // Tambahkan 'tool' dan 'industryPreference'
        $itemTypes = [
            'programmingSkill' => ['user_programming_skills', ['id', 'user_id', 'skill_name', 'skill_level', 'experience_duration', 'created_at']],
            'framework' => ['user_frameworks', ['id', 'user_id', 'framework_name', 'skill_level', 'experience_duration', 'created_at']],
            'otherSkill' => ['user_other_skills', ['id', 'user_id', 'skill_name', 'skill_level', 'experience_duration', 'created_at']],
            'education' => ['user_education_history', ['id', 'user_id', 'institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description', 'created_at']],
            'experience' => ['user_work_experience', ['id', 'user_id', 'company_name', 'job_title', 'start_date', 'end_date', 'description', 'created_at']],
            'socialLink' => ['user_social_links', ['id', 'user_id', 'platform_name', 'url', 'created_at']],
            'tool' => ['user_tools', ['id', 'user_id', 'tool_name', 'skill_level', 'experience_duration', 'created_at']], // Tabel baru: user_tools
            'industryPreference' => ['user_industry_preferences', ['id', 'user_id', 'industry_name', 'created_at']], // Tabel baru: user_industry_preferences
        ];

        foreach ($itemTypes as $frontendKey => $config) {
            $tableName = $config[0];
            $expectedFields = $config[1];
            
            $stmt = $pdo->prepare("SELECT * FROM {$tableName} WHERE user_id = :user_id ORDER BY created_at ASC, id ASC");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $fetchedItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $profileData[$frontendKey] = array_map(function($item) use ($expectedFields) {
                $processedItem = [];
                foreach ($expectedFields as $field) {
                    $processedItem[$field] = $item[$field] ?? null;
                }
                return $processedItem;
            }, $fetchedItems);
        }
        $response = ['status' => 'success', 'data' => $profileData];
    } catch (PDOException $e) {
        error_log("PDOException in handle_get_profile_data for user $userId: " . $e->getMessage() . " | SQL: " . ($stmt ? $stmt->queryString : "N/A"));
        $response['message'] = 'Terjadi kesalahan server saat mengambil data profil.';
    }
    return $response;
}

function handle_save_full_profile($pdo) {
    requireLogin();
    $userId = $_SESSION['user_id'];
    $inputData = $_POST;
    $fileData = $_FILES;
    $response = ['status' => 'error', 'message' => 'Gagal menyimpan data profil. Kesalahan Umum.'];

    // Validasi data dasar pengguna
    $userRules = [
        'firstName' => 'required|max_length:50',
        'lastName' => 'required|max_length:50',
        'bio' => 'max_length:1000', // Bio bisa lebih panjang
        'semester' => 'required|numeric|min_length:1|max_length:2',
        'ipk' => 'required|numeric', // Perlu validasi format IPK (misal, 0.00 - 4.00)
        'kota_asal' => 'required|max_length:100',
        'kecamatan' => 'required|max_length:100',
        'kelurahan' => 'required|max_length:100',
    ];
    $user_validation_errors = validate_input($inputData, $userRules);
    if (!empty($user_validation_errors)) {
        return ['status' => 'error', 'message' => 'Data pribadi tidak valid.', 'errors' => $user_validation_errors];
    }
    // Validasi IPK lebih spesifik
    $ipk = floatval($inputData['ipk']);
    if ($ipk < 0 || $ipk > 4) {
         return ['status' => 'error', 'message' => 'Data pribadi tidak valid.', 'errors' => ['ipk' => ['IPK harus antara 0.00 dan 4.00']]];
    }


    $firstName = trim($inputData['firstName']);
    $lastName = trim($inputData['lastName']);
    $nama_lengkap = trim($firstName . " " . $lastName);
    $bio = trim($inputData['bio']);
    $semester = (int)$inputData['semester'];
    $ipk_val = $inputData['ipk']; // Simpan sebagai string untuk DB jika tipe DECIMAL, atau float
    $kota_asal = trim($inputData['kota_asal']);
    $kecamatan = trim($inputData['kecamatan']);
    $kelurahan = trim($inputData['kelurahan']);
    
    $avatarPathForDB = $_SESSION['user_avatar'];

    if (isset($fileData['avatar']) && $fileData['avatar']['error'] == UPLOAD_ERR_OK) {
        $uploadDirWeb = WEB_AVATARS_PATH;
        $uploadDirPhysical = PHYSICAL_AVATARS_PATH;

        $fileName = $userId . "_" . time() . "_" . preg_replace("/[^a-zA-Z0-9.]+/", "_", basename($fileData["avatar"]["name"]));
        $targetFilePathPhysical = $uploadDirPhysical . DS . $fileName;
        $fileType = strtolower(pathinfo($targetFilePathPhysical, PATHINFO_EXTENSION));
        $allowTypes = ['jpg', 'png', 'jpeg', 'gif'];

        if (!in_array($fileType, $allowTypes)) {
            return ['status' => 'error', 'message' => "Format file avatar tidak diizinkan (hanya JPG, JPEG, PNG, GIF)."];
        }
        if ($fileData["avatar"]["size"] > (5 * 1024 * 1024)) { // 5MB
            return ['status' => 'error', 'message' => "Ukuran file avatar terlalu besar (Maks 5MB)."];
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
            error_log("Avatar move_uploaded_file failed. Error code: " . $fileData['avatar']['error']);
            return ['status' => 'error', 'message' => "Gagal mengupload file avatar."];
        }
    } elseif (isset($fileData['avatar']) && $fileData['avatar']['error'] != UPLOAD_ERR_NO_FILE) {
        error_log("Avatar upload error code: " . $fileData['avatar']['error']);
        return ['status' => 'error', 'message' => "Masalah dengan file avatar yang diupload."];
    }

    try {
        $pdo->beginTransaction();

        $stmtUser = $pdo->prepare(
            "UPDATE users SET nama_lengkap = :nama_lengkap, bio = :bio, avatar = :avatar, 
             semester = :semester, ipk = :ipk, kota_asal = :kota_asal, kecamatan = :kecamatan, kelurahan = :kelurahan, 
             updated_at = NOW() 
             WHERE id = :user_id"
        );
        $stmtUser->bindParam(':nama_lengkap', $nama_lengkap, PDO::PARAM_STR);
        $stmtUser->bindParam(':bio', $bio, PDO::PARAM_STR);
        $stmtUser->bindParam(':avatar', $avatarPathForDB, PDO::PARAM_STR);
        $stmtUser->bindParam(':semester', $semester, PDO::PARAM_INT);
        $stmtUser->bindParam(':ipk', $ipk_val, PDO::PARAM_STR); // atau PDO::PARAM_STR jika DECIMAL
        $stmtUser->bindParam(':kota_asal', $kota_asal, PDO::PARAM_STR);
        $stmtUser->bindParam(':kecamatan', $kecamatan, PDO::PARAM_STR);
        $stmtUser->bindParam(':kelurahan', $kelurahan, PDO::PARAM_STR);
        $stmtUser->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtUser->execute();

        // Update session
        $_SESSION['user_nama_lengkap'] = $nama_lengkap;
        $_SESSION['user_bio'] = $bio;
        $_SESSION['user_avatar'] = $avatarPathForDB;
        $_SESSION['user_semester'] = $semester;
        // $_SESSION['user_ipk'] = $ipk_val; // Simpan juga di session jika perlu

        $itemTypeMappings = [
            'programmingSkill' => ['user_programming_skills', ['skill_name', 'skill_level', 'experience_duration']],
            'framework' => ['user_frameworks', ['framework_name', 'skill_level', 'experience_duration']],
            'otherSkill' => ['user_other_skills', ['skill_name', 'skill_level', 'experience_duration']],
            'education' => ['user_education_history', ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description']],
            'experience' => ['user_work_experience', ['company_name', 'job_title', 'start_date', 'end_date', 'description']],
            'socialLink' => ['user_social_links', ['platform_name', 'url']],
            'tool' => ['user_tools', ['tool_name', 'skill_level', 'experience_duration']], // Kolom disesuaikan dengan skill
            'industryPreference' => ['user_industry_preferences', ['industry_name']], // Hanya nama industri
        ];
        
        $savedItemIdsMap = [];

        foreach ($itemTypeMappings as $frontendKey => $config) {
            $tableName = $config[0];
            $dbColumns = $config[1]; 

            if (isset($inputData[$frontendKey])) {
                $itemsJson = $inputData[$frontendKey];
                $items = json_decode($itemsJson, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    error_log("Invalid JSON for $frontendKey: $itemsJson. Error: " . json_last_error_msg());
                    throw new Exception("Data JSON tidak valid untuk: " . $frontendKey);
                }
                
                // Selalu hapus item lama untuk user ini dari tabel terkait
                $deleteStmt = $pdo->prepare("DELETE FROM {$tableName} WHERE user_id = :user_id");
                $deleteStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $deleteStmt->execute();

                if (is_array($items) && !empty($items)) {
                    $insertColumnNames = implode(', ', $dbColumns);
                    $insertPlaceholders = ':' . implode(', :', $dbColumns);
                    
                    $insertSql = "INSERT INTO {$tableName} (user_id, {$insertColumnNames}, created_at, updated_at) 
                                  VALUES (:user_id, {$insertPlaceholders}, NOW(), NOW())";
                    $insertStmt = $pdo->prepare($insertSql);

                    foreach ($items as $item) {
                        $insertStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                        foreach ($dbColumns as $col) {
                            $value = $item[$col] ?? null;
                            if (in_array($col, ['start_date', 'end_date']) && $value === '') {
                                $value = null;
                            }
                            // Validasi dasar untuk item (bisa diperluas)
                            if ($col === 'skill_name' || $col === 'framework_name' || $col === 'tool_name' || $col === 'institution_name' || $col === 'company_name' || $col === 'platform_name' || $col === 'industry_name') {
                                if (empty(trim((string)$value))) {
                                     throw new Exception("Nama utama untuk item di '$frontendKey' tidak boleh kosong.");
                                }
                            }
                            $insertStmt->bindValue(":$col", $value);
                        }
                        if (!$insertStmt->execute()) {
                            $errorInfo = $insertStmt->errorInfo();
                            error_log("Failed to insert item into $tableName for user $userId. SQL Error: " . $errorInfo[2] . " | Item data: " . json_encode($item));
                            throw new PDOException("Gagal menyisipkan item ke $tableName. Error: " . $errorInfo[2]);
                        }
                        
                        $lastInsertId = $pdo->lastInsertId();
                        if (isset($item['client_id'])) { // client_id dikirim dari frontend untuk item baru
                            if (!isset($savedItemIdsMap[$frontendKey])) {
                                $savedItemIdsMap[$frontendKey] = [];
                            }
                            $savedItemIdsMap[$frontendKey][$item['client_id']] = $lastInsertId;
                        }
                    }
                }
            } else {
                // Jika key tidak ada di $_POST, berarti user tidak punya item jenis ini, pastikan tabel bersih untuk user tsb.
                $deleteStmt = $pdo->prepare("DELETE FROM {$tableName} WHERE user_id = :user_id");
                $deleteStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $deleteStmt->execute();
            }
        }

        $isProfileComplete = checkProfileCompleteness($pdo, $userId); // Cek ulang dan update status di tabel users

        $pdo->commit();
        $response = [
            'status' => 'success',
            'message' => 'Data profil berhasil disimpan!',
            'user_data' => getCurrentUserData(), // Kirim data user terbaru dari session
            'saved_item_ids' => $savedItemIdsMap
        ];

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("PDOException in handle_save_full_profile for user $userId: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
        $response['message'] = 'Terjadi kesalahan database: ' . $e->getMessage();
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("Exception in handle_save_full_profile for user $userId: " . $e->getMessage());
        $response['message'] = 'Terjadi kesalahan server: ' . $e->getMessage();
    }
    return $response;
}
?>
