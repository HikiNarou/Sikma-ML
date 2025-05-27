<div class="profile-data-page">
    <h1><i class="fas fa-id-card"></i>Lengkapi Data Profil Anda</h1>
    <p class="page-subtitle">Informasi ini akan membantu kami memberikan rekomendasi magang yang lebih sesuai dan memudahkan perusahaan mengenal Anda.</p>
    
    <div id="profilePageMessage" class="auth-message" style="display:none;"></div>

    <form id="fullProfileForm" novalidate>
        <section class="profile-data-section">
            <h2><i class="fas fa-user-circle"></i>Informasi Pribadi</h2>
            <div class="form-row">
                <div class="form-group">
                    <label for="profile_firstName">Nama Depan</label>
                    <input type="text" id="profile_firstName" name="firstName" required>
                </div>
                <div class="form-group">
                    <label for="profile_lastName">Nama Belakang</label>
                    <input type="text" id="profile_lastName" name="lastName" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="profile_email">Email</label>
                    <input type="email" id="profile_email" name="email" readonly>
                </div>
                <div class="form-group">
                    <label for="profile_nim">NIM (Nomor Induk Mahasiswa)</label>
                    <input type="text" id="profile_nim" name="nim" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="profile_semester">Semester Saat Ini</label>
                    <select id="profile_semester" name="semester" required>
                        <option value="">Pilih Semester</option>
                        <?php for ($i = 1; $i <= 14; $i++): ?>
                            <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                        <?php endfor; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile_ipk">IPK Terakhir</label>
                    <input type="number" id="profile_ipk" name="ipk" step="0.01" min="0" max="4" placeholder="cth: 3.75" required>
                </div>
            </div>
            <div class="form-group">
                <label for="profile_bio">Bio Singkat</label>
                <textarea id="profile_bio" name="bio" rows="4" placeholder="Ceritakan sedikit tentang diri Anda, minat, dan tujuan karir Anda..." maxlength="1000"></textarea>
            </div>
             <div class="form-group profile-avatar-section-profilepage">
                <label>Foto Profil</label>
                <div class="avatar-wrapper">
                    <img src="<?php echo DEFAULT_AVATAR_PLACEHOLDER_URL . 'U'; ?>" alt="Pratinjau Avatar" class="profile-avatar-preview-page" id="profile_avatarPreviewPage">
                    <input type="file" id="profile_avatarUpload" name="avatar" accept="image/jpeg,image/png,image/gif" style="display: none;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('profile_avatarUpload').click();"><i class="fas fa-camera"></i> Ubah Foto</button>
                </div>
                <small class="avatar-upload-label">JPG, PNG atau GIF. Maks 5MB.</small>
            </div>
            <div class="form-group">
                <label for="profile_kota_asal">Kota Asal (Sesuai KTP)</label>
                <input type="text" id="profile_kota_asal" name="kota_asal" placeholder="cth: Palembang" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="profile_kecamatan">Kecamatan (Domisili Saat Ini)</label>
                    <input type="text" id="profile_kecamatan" name="kecamatan" placeholder="cth: Ilir Timur I" required>
                </div>
                <div class="form-group">
                    <label for="profile_kelurahan">Kelurahan (Domisili Saat Ini)</label>
                    <input type="text" id="profile_kelurahan" name="kelurahan" placeholder="cth: Sungai Pangeran" required>
                </div>
            </div>
        </section>

        <section class="profile-data-section" data-item-type="programmingSkill">
            <h2><i class="fas fa-code"></i>Keahlian Bahasa Pemrograman</h2>
            <div class="items-list-display" id="programmingSkillsListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="programmingSkill"><i class="fas fa-plus-circle"></i>Tambah Bahasa</button>
        </section>

        <section class="profile-data-section" data-item-type="framework">
            <h2><i class="fas fa-cubes"></i>Framework yang Dikuasai</h2>
            <div class="items-list-display" id="frameworksListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="framework"><i class="fas fa-plus-circle"></i>Tambah Framework</button>
        </section>

        <section class="profile-data-section" data-item-type="tool">
            <h2><i class="fas fa-tools"></i>Tools yang Dikuasai</h2>
            <div class="items-list-display" id="toolsListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="tool"><i class="fas fa-plus-circle"></i>Tambah Tool</button>
        </section>

        <section class="profile-data-section" data-item-type="otherSkill">
            <h2><i class="fas fa-puzzle-piece"></i>Keahlian Lainnya</h2>
            <div class="items-list-display" id="otherSkillsListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="otherSkill"><i class="fas fa-plus-circle"></i>Tambah Keahlian Lain</button>
        </section>

        <section class="profile-data-section" data-item-type="education">
            <h2><i class="fas fa-graduation-cap"></i>Riwayat Pendidikan</h2>
            <div class="items-list-display" id="educationListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="education"><i class="fas fa-plus-circle"></i>Tambah Pendidikan</button>
        </section>

        <section class="profile-data-section" data-item-type="experience">
            <h2><i class="fas fa-briefcase"></i>Pengalaman Kerja/Magang/Proyek</h2>
            <div class="items-list-display" id="experienceListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="experience"><i class="fas fa-plus-circle"></i>Tambah Pengalaman</button>
        </section>
        
        <section class="profile-data-section" data-item-type="socialLink">
            <h2><i class="fas fa-link"></i>Link Sosial Media & Portfolio</h2>
            <div class="items-list-display" id="socialLinksListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="socialLink"><i class="fas fa-plus-circle"></i>Tambah Link</button>
        </section>

        <section class="profile-data-section" data-item-type="industryPreference">
            <h2><i class="fas fa-industry"></i>Preferensi Bidang Industri</h2>
            <div class="items-list-display" id="industryPreferencesListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="industryPreference"><i class="fas fa-plus-circle"></i>Tambah Preferensi Industri</button>
        </section>

        <button type="submit" id="saveProfileDataBtn" class="btn btn-save-all"><i class="fas fa-save"></i>Simpan Semua Data Profil</button>
    </form>
</div>
