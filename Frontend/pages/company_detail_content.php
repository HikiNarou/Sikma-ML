<div class="company-detail-page">
    <button type="button" class="btn btn-secondary btn-back-to-explore" id="backToExploreBtn"><i class="fas fa-arrow-left"></i> Kembali ke Daftar</button>
    
    <div id="companyDetailLoading" class="loading-state" style="display: none;">
        <p><i class="fas fa-spinner fa-spin"></i> Memuat detail perusahaan...</p>
    </div>
    <div id="companyDetailErrorMessage" class="error-message-fullpage" style="display: none;"></div>

    <div id="companyDetailContentContainer" style="display: none;">
        <div class="company-detail-header">
            <div class="company-detail-logo">
                <img src="https://placehold.co/100x100/ccc/999?text=Logo" alt="Logo Perusahaan" id="companyDetailLogo">
            </div>
            <div class="company-detail-info">
                <h1 id="companyDetailName">Nama Perusahaan</h1>
                <p class="company-category-type">
                    <span class="category-tag" id="companyDetailCategoryTag">Kategori</span>
                    <span id="companyDetailType" class="company-type-badge">Tipe Perusahaan</span>
                </p>
            </div>
        </div>

        <div class="company-detail-banner">
            <img src="https://placehold.co/800x380/eee/ccc?text=Banner+Perusahaan" alt="Banner Perusahaan" id="companyDetailBannerImg">
        </div>

        <div class="company-detail-content">
            <section class="company-section">
                <h2><i class="fas fa-info-circle"></i> Tentang Perusahaan</h2>
                <p id="companyDetailLongDescription">Deskripsi lengkap perusahaan akan muncul di sini.</p>
            </section>

            <section class="company-section" id="companyRelevantTechSection" style="display:none;">
                <h2><i class="fas fa-cogs"></i> Teknologi & Keahlian Relevan</h2>
                <div id="companyDetailRelevantTech" class="relevant-tech-tags">
                    </div>
            </section>

            <section class="company-section">
                <h2><i class="fas fa-bullseye"></i> Mengapa Magang di <span id="whyInternCompanyName">Perusahaan Ini</span>?</h2>
                <ul id="companyDetailWhyIntern" class="styled-list">
                    <li>Informasi akan dimuat...</li>
                </ul>
            </section>

            <section class="company-section">
                <h2><i class="fas fa-user-graduate"></i> Informasi untuk Calon Mahasiswa Magang</h2>
                <p id="companyDetailInternshipInfo">Informasi untuk calon mahasiswa magang akan muncul di sini.</p>
            </section>
            
            <section class="company-section">
                 <h2><i class="fas fa-map-marked-alt"></i> Kontak & Lokasi</h2>
                <div class="company-detail-contact">
                    <ul>
                        <li><i class="fas fa-map-marker-alt icon-contact"></i> <strong>Alamat:</strong> <span id="companyDetailAddress">Alamat perusahaan</span></li>
                        <li style="display:none;" id="companyDetailWebsiteItem"><i class="fas fa-globe icon-contact"></i> <strong>Website:</strong> <a href="#" id="companyDetailWebsite" target="_blank" rel="noopener noreferrer">Website Perusahaan</a></li>
                        <li style="display:none;" id="companyDetailEmailItem"><i class="fas fa-envelope icon-contact"></i> <strong>Email:</strong> <a href="mailto:" id="companyDetailEmail">Email Kontak</a></li>
                        <li style="display:none;" id="companyDetailPhoneItem"><i class="fas fa-phone icon-contact"></i> <strong>Telepon:</strong> <span id="companyDetailPhone">Telepon Kontak</span></li>
                    </ul>
                </div>
            </section>
        </div>
    </div>
</div>
