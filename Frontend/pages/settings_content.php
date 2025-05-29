<div class="settings-page">
    <h1><i class="fas fa-user-cog"></i>Pengaturan Akun</h1>
    
    <div id="settingsPageMessage" class="auth-message" style="display:none;"></div>

    <section class="settings-section">
        <h2><i class="fas fa-id-badge"></i> Profil Pengguna</h2>
        <form id="profileSettingsForm" enctype="multipart/form-data" novalidate>
            <div class="profile-avatar-section">
                <img src="<?php echo htmlspecialchars($initialUserData['avatar'] ?? DEFAULT_AVATAR_PLACEHOLDER_URL . 'U'); ?>" alt="Pratinjau Avatar" class="profile-avatar-preview" id="settings_avatarPreview">
                <div>
                    <button type="button" class="avatar-upload-btn" onclick="document.getElementById('settings_avatarUpload').click();"><i class="fas fa-camera"></i> Ubah Foto</button>
                    <input type="file" id="settings_avatarUpload" name="avatar" accept="image/jpeg,image/png,image/gif" style="display: none;">
                    <p class="avatar-upload-label">JPG, PNG atau GIF. Maks 5MB.</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="settings_firstName">Nama Depan</label>
                    <input type="text" id="settings_firstName" name="firstName" required>
                </div>
                <div class="form-group">
                    <label for="settings_lastName">Nama Belakang</label>
                    <input type="text" id="settings_lastName" name="lastName" required>
                </div>
            </div>
            <div class="form-group">
                <label for="settings_email">Alamat Email</label>
                <input type="email" id="settings_email" name="email" readonly>
            </div>
             <div class="form-group">
                <label for="settings_nim">NIM (Nomor Induk Mahasiswa)</label>
                <input type="text" id="settings_nim" name="nim" readonly>
            </div>
            <div class="form-group">
                <label for="settings_semester">Semester Saat Ini</label> <select id="settings_semester" name="semester" required>
                    <option value="">Pilih Semester</option>
                    <?php for ($i = 1; $i <= 14; $i++): ?>
                        <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                    <?php endfor; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="settings_bio">Bio Singkat</label>
                <textarea id="settings_bio" name="bio" placeholder="Ceritakan sedikit tentang diri Anda..." maxlength="1000"></textarea>
            </div>
            <div id="profileUpdateMessage" class="auth-message" style="display:none;"></div>
            <button type="submit" class="btn-save-changes"><i class="fas fa-save"></i> Simpan Perubahan Profil</button>
        </form>
    </section>

    <section class="settings-section">
        <h2><i class="fas fa-key"></i> Ubah Kata Sandi</h2>
        <form id="changePasswordForm" novalidate>
            <div class="form-group">
                <label for="currentPassword">Kata Sandi Saat Ini</label>
                <div class="password-wrapper">
                    <input type="password" id="currentPassword" name="currentPassword" required>
                    <i class="fas fa-eye-slash toggle-password" data-target="currentPassword"></i>
                </div>
            </div>
            <div class="form-group">
                <label for="newPassword">Kata Sandi Baru</label>
                <div class="password-wrapper">
                    <input type="password" id="newPassword" name="newPassword" required minlength="6">
                    <i class="fas fa-eye-slash toggle-password" data-target="newPassword"></i>
                </div>
                 <small class="password-strength-indicator" id="new_password_strength"></small>
            </div>
            <div class="form-group">
                <label for="confirmNewPassword">Konfirmasi Kata Sandi Baru</label>
                 <div class="password-wrapper">
                    <input type="password" id="confirmNewPassword" name="confirmNewPassword" required>
                    <i class="fas fa-eye-slash toggle-password" data-target="confirmNewPassword"></i>
                </div>
            </div>
            <div id="passwordChangeMessage" class="auth-message" style="display:none;"></div>
            <button type="submit" class="btn-save-changes"><i class="fas fa-key"></i> Ubah Kata Sandi</button>
        </form>
    </section>

    <section class="settings-section">
        <h2><i class="fas fa-palette"></i> Preferensi Situs</h2>
        <div class="preference-item">
            <p><i class="fas fa-moon"></i> Tema Gelap</p>
            <label class="toggle-switch">
                <input type="checkbox" id="darkModeToggleSettings"> <span class="slider"></span>
            </label>
        </div>
    </section>

    <section class="settings-section">
        <h2><i class="fas fa-user-slash"></i> Tindakan Akun</h2>
        <div class="form-group">
            <label for="deactivateAccountBtn">Nonaktifkan Akun</label>
            <p class="setting-description">Tindakan ini akan menonaktifkan akun Anda. Anda perlu menghubungi administrator untuk mengaktifkannya kembali.</p>
            <button type="button" class="btn btn-danger" id="deactivateAccountBtn"><i class="fas fa-user-alt-slash"></i> Nonaktifkan Akun Saya</button>
        </div>
         <div id="deactivationMessage" class="auth-message" style="display:none;"></div>
    </section>
</div>
