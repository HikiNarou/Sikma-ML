// SikmaV3 - assets/js/page_home.js (Diperbarui)

const PageHome = {
  // DOM Elements
  recommendationSwiperWrapper: null,
  recommendationSwiperContainer: null,
  noRecommendationsMessage: null,

  companyCategoryFilter: null,
  companyGrid: null,
  activeFilterDisplay: null,
  noCompanyResultsMessage: null,
  companyListLoading: null,

  // State
  recommendationSwiperInstance: null,
  allCompanyData: [], // Menyimpan semua data perusahaan yang diambil dari API
  isPageInitialized: false, // Flag untuk menandai apakah inisialisasi dasar sudah dilakukan

  initialize: () => {
    // Inisialisasi dasar yang hanya perlu dilakukan sekali saat script dimuat
    // atau saat elemen DOM pertama kali tersedia.
    // Pengambilan data dan rendering akan di-handle oleh loadPageData().
    if (PageHome.isPageInitialized) return;

    console.log(
      "PageHome: Initializing (caching static elements & base listeners)..."
    );

    PageHome.recommendationSwiperWrapper = UI.getElement(
      "#recommendationSwiperWrapper"
    );
    PageHome.recommendationSwiperContainer = UI.getElement(
      ".recommendation-swiper-container"
    );
    PageHome.noRecommendationsMessage = UI.getElement(
      "#noRecommendationsMessage"
    );

    PageHome.companyCategoryFilter = UI.getElement("#companyCategoryFilter");
    PageHome.companyGrid = UI.getElement("#companyGrid");
    PageHome.activeFilterDisplay = UI.getElement("#activeFilterDisplay");
    PageHome.noCompanyResultsMessage = UI.getElement(
      "#noCompanyResultsMessage"
    );
    PageHome.companyListLoading = UI.getElement("#companyListLoading");

    PageHome._initCategoryFilter();
    PageHome._initCompanyCardLinks(); // Untuk kartu yang mungkin sudah ada di HTML atau ditambahkan dinamis

    PageHome.isPageInitialized = true;
    console.log("PageHome: Basic initialization complete.");
  },

  loadPageData: async () => {
    // Fungsi ini akan dipanggil oleh AppCore.navigateToPage setiap kali halaman Home aktif
    console.log("PageHome: Loading page data...");
    if (!PageHome.isPageInitialized) {
      PageHome.initialize(); // Pastikan elemen dasar di-cache
    }

    PageHome.resetPageVisuals(); // Bersihkan tampilan sebelum memuat data baru

    // Muat data rekomendasi (bisa dari endpoint berbeda atau subset dari company list)
    // Untuk sekarang, kita akan gunakan sebagian dari company list sebagai rekomendasi
    await PageHome._loadAndDisplayCompanies(); // Ini juga akan mengisi PageHome.allCompanyData

    // Setelah allCompanyData terisi, populate swiper
    PageHome._populateRecommendationSwiper();
    PageHome._initSwiper(); // Inisialisasi atau update Swiper setelah konten ada
  },

  resetPageVisuals: () => {
    // Fungsi ini membersihkan konten dinamis tanpa menghancurkan listener dasar
    console.log("PageHome: Resetting page visuals...");
    if (
      PageHome.recommendationSwiperInstance &&
      typeof PageHome.recommendationSwiperInstance.destroy === "function"
    ) {
      try {
        PageHome.recommendationSwiperInstance.destroy(true, true);
      } catch (e) {
        console.warn("Swiper destroy error:", e);
      }
      PageHome.recommendationSwiperInstance = null;
    }
    if (PageHome.recommendationSwiperWrapper)
      PageHome.recommendationSwiperWrapper.innerHTML = "";
    if (PageHome.companyGrid) PageHome.companyGrid.innerHTML = "";

    // Reset filter dan pesan
    if (PageHome.companyCategoryFilter)
      PageHome.companyCategoryFilter.value = "";
    if (PageHome.activeFilterDisplay)
      UI.hideElement(PageHome.activeFilterDisplay);
    if (PageHome.noRecommendationsMessage)
      UI.hideElement(PageHome.noRecommendationsMessage);
    if (PageHome.noCompanyResultsMessage)
      UI.hideElement(PageHome.noCompanyResultsMessage);
    if (PageHome.companyListLoading)
      UI.hideElement(PageHome.companyListLoading);
  },

  resetPage: () => {
    // Fungsi reset penuh, mungkin dipanggil saat logout
    PageHome.resetPageVisuals();
    PageHome.allCompanyData = [];
    // Listener dasar di #companyCategoryFilter dan #companyGrid tidak perlu dihapus jika elemennya tetap
    // PageHome.isPageInitialized = false; // Jangan di-reset agar initialize() tidak dipanggil berulang
    console.log("PageHome: Full page reset.");
  },

  _initSwiper: () => {
    if (
      PageHome.recommendationSwiperContainer &&
      PageHome.recommendationSwiperWrapper &&
      PageHome.recommendationSwiperWrapper.children.length > 0 &&
      typeof Swiper !== "undefined"
    ) {
      if (PageHome.recommendationSwiperInstance) {
        // Hancurkan instance lama jika ada
        try {
          PageHome.recommendationSwiperInstance.destroy(true, true);
        } catch (e) {
          console.warn("Swiper destroy error on re-init:", e);
        }
      }
      PageHome.recommendationSwiperInstance = new Swiper(
        PageHome.recommendationSwiperContainer,
        {
          effect: "slide",
          slidesPerView: 1.2,
          spaceBetween: 15,
          centeredSlides: false,
          loop: PageHome.recommendationSwiperWrapper.children.length > 3, // Loop jika slide cukup banyak
          autoplay: {
            delay: 4500,
            disableOnInteraction: false,
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          breakpoints: {
            640: { slidesPerView: 1.8, spaceBetween: 20 },
            768: { slidesPerView: 2.2, spaceBetween: 20 },
            1024: { slidesPerView: 2.8, spaceBetween: 25 },
            1200: { slidesPerView: 3.2, spaceBetween: 25 },
          },
        }
      );
      PageHome._initSwiperCardLinks(); // Pastikan link di slide baru berfungsi
    } else if (typeof Swiper === "undefined") {
      console.warn("Swiper library is not loaded.");
    } else if (
      PageHome.recommendationSwiperWrapper &&
      PageHome.recommendationSwiperWrapper.children.length === 0
    ) {
      console.log("PageHome: No slides to initialize Swiper.");
      if (PageHome.noRecommendationsMessage)
        UI.showElement(PageHome.noRecommendationsMessage, "block");
    }
  },

  _populateRecommendationSwiper: async () => {
    if (!PageHome.recommendationSwiperWrapper) return;
    PageHome.recommendationSwiperWrapper.innerHTML = ""; // Clear existing slides

    let recommendedCompanies = [];

    // Check if user is logged in
    if (window.sikmaApp?.isUserLoggedIn) {
      // Get user profile data
      const profileResponse = await Api.getProfileData();
      if (profileResponse.status === "success") {
        // Get personalized recommendations using profile data
        const recommendationsResponse = await Api.getRecommendations({
          skills: profileResponse.data?.skills || [],
        });

        if (recommendationsResponse.status === "success") {
          recommendedCompanies = recommendationsResponse.data || [];
        } else {
          console.error(
            "Failed to fetch recommendations:",
            recommendationsResponse.message
          );
        }
      } else {
        console.error("Failed to fetch user profile:", profileResponse.message);
      }
    }

    // If not logged in or failed to get recommendations, use top companies from allCompanyData
    if (recommendedCompanies.length === 0) {
      recommendedCompanies = PageHome.allCompanyData.slice(0, 5);
    }

    if (recommendedCompanies.length === 0) {
      if (PageHome.noRecommendationsMessage)
        UI.showElement(PageHome.noRecommendationsMessage, "block");
      return;
    }
    if (PageHome.noRecommendationsMessage)
      UI.hideElement(PageHome.noRecommendationsMessage);

    recommendedCompanies.forEach((company) => {
      // Placeholder untuk skor dan alasan, karena backend belum menyediakan
      const matchScore = Math.floor(Math.random() * (95 - 70 + 1)) + 70 + "%"; // Random 70-95%
      const reasons = [
        "Cocok dengan keahlian Anda.",
        "Sesuai preferensi industri.",
        "Populer di kalangan mahasiswa.",
        "Lokasi strategis.",
      ];
      const matchReason = reasons[Math.floor(Math.random() * reasons.length)];

      const slide = document.createElement("div");
      slide.className = "swiper-slide card recommendation-card";
      slide.style.backgroundImage = `url('${UI.escapeHTML(
        company.imageUrl ||
          company.logo_url ||
          "https://placehold.co/400x240/777/fff?text=Image"
      )}')`;
      slide.dataset.companyid = company.id;

      slide.innerHTML = `
                <div class="card-overlay"></div>
                <div class="card-content">
                    <h3>${UI.escapeHTML(company.name)}</h3>
                    <p class="card-subtitle">${UI.escapeHTML(
                      company.category || "Industri Umum"
                    )}</p>
                    <div class="recommendation-details">
                        <p class="match-score"><strong>Kecocokan:</strong> <span class="score-value">${matchScore}</span></p> 
                        <p class="match-reason"><strong>Alasan:</strong> <span class="reason-text">${matchReason}</span></p>
                    </div>
                    <p class="card-description">${UI.escapeHTML(
                      company.description || "Deskripsi tidak tersedia."
                    )}</p>
                    <button class="btn btn-sm btn-primary btn-detail company-detail-link" data-companyid="${
                      company.id
                    }"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
                </div>
            `;
      PageHome.recommendationSwiperWrapper.appendChild(slide);
    });
  },

  _initSwiperCardLinks: () => {
    if (PageHome.recommendationSwiperWrapper) {
      // Gunakan event delegation karena slide bisa dinamis
      PageHome.recommendationSwiperWrapper.addEventListener(
        "click",
        (event) => {
          const cardLink = event.target.closest(
            ".recommendation-card[data-companyid], .btn-detail[data-companyid]"
          );
          if (cardLink) {
            event.preventDefault();
            const companyId = cardLink.dataset.companyid;
            PageHome._navigateToCompanyDetail(companyId);
          }
        }
      );
    }
  },

  _initCategoryFilter: () => {
    if (PageHome.companyCategoryFilter) {
      PageHome.companyCategoryFilter.removeEventListener(
        "change",
        PageHome._handleCategoryFilterChange
      ); // Hapus listener lama
      PageHome.companyCategoryFilter.addEventListener(
        "change",
        PageHome._handleCategoryFilterChange
      );
    }
  },
  _handleCategoryFilterChange: function () {
    // 'this' akan merujuk ke select element
    const selectedCategory = this.value;
    PageHome.filterCompanyGrid(selectedCategory);
    // Jika ada search term aktif, terapkan juga search filter
    const mainSearchInput = UI.getElement("#mainSearchInput");
    if (mainSearchInput && mainSearchInput.value.trim() !== "") {
      PageHome.filterCompaniesBySearch(mainSearchInput.value.trim());
    }
  },

  filterCompanyGrid: (selectedCategory) => {
    if (!PageHome.companyGrid) return;
    const companyCards = PageHome.companyGrid.querySelectorAll(
      ".card.card-hover-effect"
    );
    let visibleCount = 0;
    selectedCategory = selectedCategory.toLowerCase();

    companyCards.forEach((card) => {
      const cardCategory = card.dataset.category
        ? card.dataset.category.toLowerCase()
        : "";
      // Cek juga dengan search term yang mungkin aktif
      const mainSearchInput = UI.getElement("#mainSearchInput");
      const searchTerm = mainSearchInput
        ? mainSearchInput.value.trim().toLowerCase()
        : "";
      const cardTitle =
        card.querySelector(".card-title")?.textContent.toLowerCase() || "";
      const cardDescription =
        card.querySelector(".card-creator")?.textContent.toLowerCase() || "";

      const matchesCategory =
        selectedCategory === "" || cardCategory === selectedCategory;
      const matchesSearch =
        searchTerm === "" ||
        cardTitle.includes(searchTerm) ||
        cardDescription.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        UI.removeClass(card, "hidden-by-filter");
        visibleCount++;
      } else {
        UI.addClass(card, "hidden-by-filter");
      }
    });
    PageHome._updateFilterDisplayAndNoResults(
      selectedCategory,
      UI.getElement("#mainSearchInput")?.value.trim() || "",
      visibleCount
    );
  },

  filterCompaniesBySearch: (searchTerm) => {
    if (!PageHome.companyGrid) return;
    searchTerm = searchTerm.toLowerCase().trim();
    const currentCategoryFilter = PageHome.companyCategoryFilter
      ? PageHome.companyCategoryFilter.value.toLowerCase()
      : "";
    let visibleCount = 0;

    const companyCards = PageHome.companyGrid.querySelectorAll(
      ".card.card-hover-effect"
    );
    companyCards.forEach((card) => {
      const cardTitle =
        card.querySelector(".card-title")?.textContent.toLowerCase() || "";
      const cardDescription =
        card.querySelector(".card-creator")?.textContent.toLowerCase() || "";
      const cardCategory = card.dataset.category
        ? card.dataset.category.toLowerCase()
        : "";

      const matchesSearch =
        searchTerm === "" ||
        cardTitle.includes(searchTerm) ||
        cardDescription.includes(searchTerm);
      const matchesCategory =
        currentCategoryFilter === "" || cardCategory === currentCategoryFilter;

      if (matchesSearch && matchesCategory) {
        UI.removeClass(card, "hidden-by-filter");
        visibleCount++;
      } else {
        UI.addClass(card, "hidden-by-filter");
      }
    });
    PageHome._updateFilterDisplayAndNoResults(
      currentCategoryFilter,
      searchTerm,
      visibleCount
    );
  },

  _updateFilterDisplayAndNoResults: (category, searchTerm, visibleCount) => {
    let filterTextParts = [];
    if (category !== "" && PageHome.companyCategoryFilter) {
      const selectedOptionText =
        PageHome.companyCategoryFilter.options[
          PageHome.companyCategoryFilter.selectedIndex
        ].text;
      if (selectedOptionText !== "Semua Kategori") {
        // Jangan tampilkan jika "Semua Kategori"
        filterTextParts.push(`Kategori: ${selectedOptionText}`);
      }
    }
    if (searchTerm !== "") {
      filterTextParts.push(`Pencarian: "${UI.escapeHTML(searchTerm)}"`);
    }

    if (filterTextParts.length > 0) {
      PageHome.activeFilterDisplay.textContent = `Filter aktif: ${filterTextParts.join(
        " & "
      )} (${visibleCount} hasil)`;
      UI.showElement(PageHome.activeFilterDisplay, "block");
    } else {
      UI.hideElement(PageHome.activeFilterDisplay);
    }

    if (visibleCount === 0 && (category !== "" || searchTerm !== "")) {
      if (PageHome.noCompanyResultsMessage)
        UI.showElement(PageHome.noCompanyResultsMessage, "block");
    } else {
      if (PageHome.noCompanyResultsMessage)
        UI.hideElement(PageHome.noCompanyResultsMessage);
    }
  },

  _initCompanyCardLinks: () => {
    if (PageHome.companyGrid) {
      PageHome.companyGrid.addEventListener("click", (event) => {
        const cardLink = event.target.closest(".company-detail-link"); // Target bisa tombol atau link <a>
        if (cardLink) {
          event.preventDefault();
          const companyId = cardLink.dataset.companyid;
          PageHome._navigateToCompanyDetail(companyId);
        }
      });
    }
  },

  _navigateToCompanyDetail: (companyId) => {
    if (
      companyId &&
      typeof PageCompanyDetail !== "undefined" &&
      typeof PageCompanyDetail.displayCompanyDetails === "function"
    ) {
      PageCompanyDetail.displayCompanyDetails(companyId);
    } else if (companyId) {
      // Fallback jika PageCompanyDetail belum siap
      AppCore.navigateToPage("page-company-detail", null, "Detail Perusahaan");
      // Mungkin perlu cara untuk mengirim companyId ke PageCompanyDetail jika tidak langsung dipanggil
      // Ini bisa dilakukan dengan menyimpan ID di state global atau parameter URL (jika routing diimplementasikan)
      // Untuk saat ini, asumsikan PageCompanyDetail akan mengambil ID dari state atau parameter
      if (window.fetchAndDisplayCompanyDetails)
        window.fetchAndDisplayCompanyDetails(companyId);
    }
  },

  _loadAndDisplayCompanies: async () => {
    if (
      !PageHome.companyGrid ||
      !PageHome.companyListLoading ||
      !PageHome.noCompanyResultsMessage
    )
      return;

    UI.showElement(PageHome.companyListLoading, "block");
    UI.hideElement(PageHome.noCompanyResultsMessage);
    PageHome.companyGrid.innerHTML = ""; // Kosongkan grid sebelum memuat

    const response = await Api.getCompanyList(); // API baru untuk daftar perusahaan

    UI.hideElement(PageHome.companyListLoading);

    if (
      response.status === "success" &&
      response.companies &&
      response.companies.length > 0
    ) {
      PageHome.allCompanyData = response.companies; // Simpan data asli
      response.companies.forEach((company) =>
        PageHome.addCompanyToGrid(company)
      );
    } else if (
      response.status === "success" &&
      (!response.companies || response.companies.length === 0)
    ) {
      PageHome.allCompanyData = [];
      UI.showElement(PageHome.noCompanyResultsMessage, "block");
      PageHome.noCompanyResultsMessage.innerHTML = `<p><i class="fas fa-info-circle"></i> Belum ada data perusahaan yang tersedia saat ini.</p>`;
    } else {
      PageHome.allCompanyData = [];
      UI.showElement(PageHome.noCompanyResultsMessage, "block");
      PageHome.noCompanyResultsMessage.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${UI.escapeHTML(
        response.message || "Gagal memuat daftar perusahaan."
      )}</p>`;
    }
    // Setelah data dimuat, reset filter display
    PageHome._updateFilterDisplayAndNoResults(
      PageHome.companyCategoryFilter?.value || "",
      UI.getElement("#mainSearchInput")?.value.trim() || "",
      PageHome.allCompanyData.length
    );
  },

  addCompanyToGrid: (companyData) => {
    if (!PageHome.companyGrid) return;

    const card = document.createElement("div");
    card.className = `card card-hover-effect company-card-${companyData.id}`;
    card.dataset.companyId = companyData.id;
    card.dataset.category = companyData.category || "Lainnya"; // Pastikan ada category

    const name = UI.escapeHTML(companyData.name);
    const categoryDisplay = UI.escapeHTML(companyData.category || "Lainnya");
    const typeDisplay = UI.escapeHTML(companyData.type || "N/A");
    const description = UI.escapeHTML(
      companyData.description || "Deskripsi tidak tersedia."
    );
    const imageUrl = UI.escapeHTML(
      companyData.imageUrl ||
        companyData.logo_url ||
        "https://placehold.co/325x200/ccc/999?text=No+Image"
    );
    const tagClass = `tag-${categoryDisplay
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/&/g, "and")}`;

    card.innerHTML = `
            <div class="card-img"></div> <a href="#page-company-detail?id=${companyData.id}" class="card-link company-detail-link" data-companyid="${companyData.id}" aria-label="Lihat detail untuk ${name}">
                <div class="card-img-hovered" style="background-image: var(--card-img-hovered-overlay), url('${imageUrl}');">
                    <span class="visually-hidden">Gambar ${name}</span>
                </div>
            </a>
            <div class="card-info">
                <div class="card-about">
                    <span class="card-tag ${tagClass}">${categoryDisplay}</span>
                    <div class="card-time">${typeDisplay}</div>
                </div>
                <h3 class="card-title">${name}</h3> <div class="card-creator">${description}</div>
                <button class="btn btn-sm btn-primary btn-detail explore-btn-detail company-detail-link" data-companyid="${companyData.id}"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
            </div>
        `;
    PageHome.companyGrid.appendChild(card);
  },
};

// Panggil initialize dasar saat script dimuat jika elemen sudah ada
// document.addEventListener('DOMContentLoaded', PageHome.initialize);
// Inisialisasi akan dipanggil oleh AppCore.navigateToPage
