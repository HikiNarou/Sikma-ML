<section class="internship-recommendations">
    <h2><i class="fas fa-star"></i> Rekomendasi Magang Untukmu</h2>
    <div class="swiper-container recommendation-swiper-container"> 
        <div class="swiper-wrapper" id="recommendationSwiperWrapper">
            </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
    </div>
    <div id="noRecommendationsMessage" class="no-results-message" style="display:none; margin-top: 15px;">
        <p><i class="fas fa-info-circle"></i> Belum ada rekomendasi magang untuk Anda. Lengkapi profil Anda untuk mendapatkan rekomendasi.</p>
    </div>
</section>

<section class="explore-companies">
    <div class="explore-header">
        <h2><i class="fas fa-building"></i> Jelajahi Perusahaan Lainnya</h2>
        <div class="category-filter">
            <select id="companyCategoryFilter" aria-label="Filter Kategori Perusahaan">
                <option value="">Semua Kategori</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Keuangan">Keuangan & Perbankan</option>
                <option value="Manufaktur">Manufaktur</option>
                <option value="Energi & Pertambangan">Energi & Pertambangan</option>
                <option value="Transportasi & Logistik">Transportasi & Logistik</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Pemerintahan">Pemerintahan</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Startup">Startup</option>
                </select>
        </div>
    </div>
    <div id="activeFilterDisplay" class="active-filter-display" style="display:none;"></div>
    <div class="company-grid" id="companyGrid">
        </div>
    <div id="noCompanyResultsMessage" class="no-results-message" style="display:none; margin-top: 20px;">
        <p><i class="fas fa-search-minus"></i> Tidak ada perusahaan yang cocok dengan filter atau pencarian Anda.</p>
    </div>
    <div id="companyListLoading" class="loading-state" style="display: none; margin-top: 20px;">
        <p><i class="fas fa-spinner fa-spin"></i> Memuat daftar perusahaan...</p>
    </div>
</section>
