<?php
// SikmaV3 - includes/db_connect.php

// Sertakan file konfigurasi jika belum disertakan (meskipun biasanya auth.php atau index.php yang akan menyertakannya pertama kali)
if (!defined('APP_NAME')) {
    require_once __DIR__ . '/config.php';
}

// Gunakan konstanta dari config.php jika Anda memindahkannya ke sana
// Jika tidak, biarkan definisi DB_ di sini.
// Untuk contoh ini, saya asumsikan definisi DB_SERVER, dll., tetap di sini untuk meminimalkan perubahan awal.
if (!defined('DB_SERVER')) define('DB_SERVER', 'localhost');
if (!defined('DB_USERNAME')) define('DB_USERNAME', 'root'); // Sesuaikan dengan konfigurasi Anda
if (!defined('DB_PASSWORD')) define('DB_PASSWORD', '');   // Sesuaikan dengan konfigurasi Anda
if (!defined('DB_NAME')) define('DB_NAME', 'sikma_dbv3'); // Sesuaikan dengan nama database Anda

try {
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); // Set fetch mode default
    $pdo->exec("SET NAMES 'utf8mb4'");
} catch(PDOException $e){
    // Di lingkungan produksi, ini harus dicatat ke log, bukan ditampilkan ke pengguna.
    error_log("Koneksi Database Gagal: " . $e->getMessage()); // Catat error ke log server

    // Kirim respon JSON yang lebih umum untuk klien
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => "Terjadi masalah dengan koneksi ke database. Silakan coba lagi nanti atau hubungi administrator."
        // Jangan sertakan $e->getMessage() di produksi untuk alasan keamanan
    ]);
    exit; // Hentikan eksekusi
}
?>
