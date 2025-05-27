// SikmaV3 - assets/js/page_company_detail.js (Diperbarui)

const PageCompanyDetail = {
    // DOM Elements
    pageContainer: null,
    loadingIndicator: null,
    errorMessageDiv: null,
    contentContainer: null,

    // Specific detail elements
    companyNameEl: null,
    companyCategoryTagEl: null,
    companyTypeEl: null,
    companyLogoEl: null,
    companyBannerImgEl: null,
    companyLongDescriptionEl: null,
    companyRelevantTechSection: null, // Baru
    companyRelevantTechContainer: null, // Baru
    companyAddressEl: null,
    companyWebsiteLinkEl: null,
    companyWebsiteItemEl: null, // Baru (untuk <li>)
    companyEmailLinkEl: null,
    companyEmailItemEl: null,   // Baru (untuk <li>)
    companyPhoneEl: null,
    companyPhoneItemEl: null,   // Baru (untuk <li>)
    whyInternCompanyNameEl: null,
    whyInternListEl: null,
    internshipInfoEl: null,
    backToExploreBtn: null,

    currentCompanyId: null,
    isPageInitialized: false,

    initialize: () => {
        // Inisialisasi dasar yang hanya perlu dilakukan sekali.
        if (PageCompanyDetail.isPageInitialized) return;
        console.log("PageCompanyDetail: Initializing (caching static elements)...");

        PageCompanyDetail.pageContainer = UI.getElement('#page-company-detail');
        PageCompanyDetail.loadingIndicator = UI.getElement('#companyDetailLoading');
        PageCompanyDetail.errorMessageDiv = UI.getElement('#companyDetailErrorMessage');
        PageCompanyDetail.contentContainer = UI.getElement('#companyDetailContentContainer');

        PageCompanyDetail.companyNameEl = UI.getElement('#companyDetailName');
        PageCompanyDetail.companyCategoryTagEl = UI.getElement('#companyDetailCategoryTag');
        PageCompanyDetail.companyTypeEl = UI.getElement('#companyDetailType');
        PageCompanyDetail.companyLogoEl = UI.getElement('#companyDetailLogo');
        PageCompanyDetail.companyBannerImgEl = UI.getElement('#companyDetailBannerImg');
        PageCompanyDetail.companyLongDescriptionEl = UI.getElement('#companyDetailLongDescription');
        PageCompanyDetail.companyRelevantTechSection = UI.getElement('#companyRelevantTechSection');
        PageCompanyDetail.companyRelevantTechContainer = UI.getElement('#companyDetailRelevantTech');
        PageCompanyDetail.companyAddressEl = UI.getElement('#companyDetailAddress');
        
        PageCompanyDetail.companyWebsiteLinkEl = UI.getElement('#companyDetailWebsite');
        PageCompanyDetail.companyWebsiteItemEl = UI.getElement('#companyDetailWebsiteItem');
        PageCompanyDetail.companyEmailLinkEl = UI.getElement('#companyDetailEmail');
        PageCompanyDetail.companyEmailItemEl = UI.getElement('#companyDetailEmailItem');
        PageCompanyDetail.companyPhoneEl = UI.getElement('#companyDetailPhone');
        PageCompanyDetail.companyPhoneItemEl = UI.getElement('#companyDetailPhoneItem');
        
        PageCompanyDetail.whyInternCompanyNameEl = UI.getElement('#whyInternCompanyName');
        PageCompanyDetail.whyInternListEl = UI.getElement('#companyDetailWhyIntern');
        PageCompanyDetail.internshipInfoEl = UI.getElement('#companyDetailInternshipInfo');
        PageCompanyDetail.backToExploreBtn = UI.getElement('#backToExploreBtn');

        if (PageCompanyDetail.backToExploreBtn) {
            PageCompanyDetail.backToExploreBtn.removeEventListener('click', PageCompanyDetail._handleBackButtonClick);
            PageCompanyDetail.backToExploreBtn.addEventListener('click', PageCompanyDetail._handleBackButtonClick);
        }
        PageCompanyDetail.isPageInitialized = true;
        console.log("PageCompanyDetail: Basic initialization complete.");
    },

    _handleBackButtonClick: () => {
        // Navigasi kembali ke halaman home atau halaman sebelumnya yang relevan
        // Untuk SPA sederhana, kembali ke home adalah pilihan aman.
        // Jika ada history yang lebih kompleks, bisa dipertimbangkan.
        if (AppCore && typeof AppCore.navigateToPage === 'function') {
            AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
        } else {
            window.location.hash = '#page-home'; // Fallback jika AppCore tidak siap
        }
    },

    // Fungsi ini dipanggil oleh AppCore saat halaman ini menjadi aktif (jika diperlukan)
    // Namun, pemuatan data utama terjadi melalui displayCompanyDetails.
    preparePage: () => {
        if (!PageCompanyDetail.isPageInitialized) {
            PageCompanyDetail.initialize();
        }
        // Reset tampilan sebelum data baru dimuat (jika pengguna kembali ke halaman ini tanpa ID baru)
        if (!PageCompanyDetail.currentCompanyId && PageCompanyDetail.contentContainer && PageCompanyDetail.contentContainer.style.display !== 'none') {
            PageCompanyDetail.resetPage();
            UI.showElement(PageCompanyDetail.errorMessageDiv, 'block');
            PageCompanyDetail.errorMessageDiv.innerHTML = `<p><i class="fas fa-info-circle"></i> Pilih perusahaan dari halaman utama untuk melihat detailnya.</p>`;
        }
    },
    
    resetPage: () => {
        console.log("PageCompanyDetail: Resetting page content...");
        if (PageCompanyDetail.contentContainer) UI.hideElement(PageCompanyDetail.contentContainer);
        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator);
        if (PageCompanyDetail.errorMessageDiv) UI.hideElement(PageCompanyDetail.errorMessageDiv);
        
        // Reset text/src/href dari elemen-elemen detail
        const defaultAvatar = window.sikmaApp?.baseUrl + '/assets/images/default_avatar.png'; // Atau placeholder lain
        const defaultBanner = 'https://placehold.co/800x380/eee/ccc?text=Banner+Perusahaan';
        const defaultLogo = 'https://placehold.co/100x100/ccc/999?text=Logo';

        if(PageCompanyDetail.companyNameEl) PageCompanyDetail.companyNameEl.textContent = 'Nama Perusahaan';
        if(PageCompanyDetail.companyCategoryTagEl) PageCompanyDetail.companyCategoryTagEl.textContent = 'Kategori';
        if(PageCompanyDetail.companyTypeEl) PageCompanyDetail.companyTypeEl.textContent = 'Tipe';
        if(PageCompanyDetail.companyLogoEl) PageCompanyDetail.companyLogoEl.src = defaultLogo;
        if(PageCompanyDetail.companyBannerImgEl) PageCompanyDetail.companyBannerImgEl.src = defaultBanner;
        if(PageCompanyDetail.companyLongDescriptionEl) PageCompanyDetail.companyLongDescriptionEl.innerHTML = 'Deskripsi akan dimuat...';
        if(PageCompanyDetail.companyRelevantTechContainer) PageCompanyDetail.companyRelevantTechContainer.innerHTML = '';
        if(PageCompanyDetail.companyRelevantTechSection) UI.hideElement(PageCompanyDetail.companyRelevantTechSection);
        if(PageCompanyDetail.companyAddressEl) PageCompanyDetail.companyAddressEl.textContent = 'Alamat akan dimuat...';
        
        [PageCompanyDetail.companyWebsiteLinkEl, PageCompanyDetail.companyEmailLinkEl].forEach(el => {
            if(el) { el.href = '#'; el.textContent = 'Memuat...'; }
        });
        if(PageCompanyDetail.companyPhoneEl) PageCompanyDetail.companyPhoneEl.textContent = 'Memuat...';
        [PageCompanyDetail.companyWebsiteItemEl, PageCompanyDetail.companyEmailItemEl, PageCompanyDetail.companyPhoneItemEl].forEach(el => {
            if(el) UI.hideElement(el);
        });

        if(PageCompanyDetail.whyInternCompanyNameEl) PageCompanyDetail.whyInternCompanyNameEl.textContent = 'Perusahaan Ini';
        if(PageCompanyDetail.whyInternListEl) PageCompanyDetail.whyInternListEl.innerHTML = '<li>Informasi akan dimuat...</li>';
        if(PageCompanyDetail.internshipInfoEl) PageCompanyDetail.internshipInfoEl.innerHTML = 'Informasi akan dimuat...';
        
        PageCompanyDetail.currentCompanyId = null;
    },

    displayCompanyDetails: async (companyId) => {
        if (!companyId) {
            console.error("PageCompanyDetail: Company ID is required.");
            PageCompanyDetail.resetPage(); // Reset jika tidak ada ID
            UI.showElement(PageCompanyDetail.errorMessageDiv, 'block');
            PageCompanyDetail.errorMessageDiv.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ID Perusahaan tidak valid untuk menampilkan detail.</p>`;
            AppCore.navigateToPage('page-company-detail', null, 'Error Data Perusahaan');
            return;
        }
        
        if (!PageCompanyDetail.isPageInitialized) {
            PageCompanyDetail.initialize(); 
        }

        PageCompanyDetail.currentCompanyId = companyId;
        // Navigasi ke halaman detail (AppCore akan menangani ini jika belum aktif)
        // Jika sudah di halaman detail dan hanya ID berubah, tidak perlu navigasi ulang AppCore
        if (AppCore.activePageId !== 'page-company-detail') {
            AppCore.navigateToPage('page-company-detail', null, 'Memuat Detail Perusahaan...');
        } else {
            document.title = `${window.sikmaApp.appName || 'SIKMA'} - Memuat Detail Perusahaan...`;
        }


        PageCompanyDetail.resetPageVisuals(); // Bersihkan tampilan sebelum memuat data baru untuk ID ini
        UI.showElement(PageCompanyDetail.loadingIndicator, 'block');

        const response = await Api.getCompanyDetails(companyId);

        UI.hideElement(PageCompanyDetail.loadingIndicator);

        if (response.status === 'success' && response.company) {
            PageCompanyDetail._populateCompanyData(response.company);
            UI.showElement(PageCompanyDetail.contentContainer, 'block');
            document.title = `${window.sikmaApp.appName || 'SIKMA'} - ${response.company.name || 'Detail Perusahaan'}`;
            // Update URL hash dengan ID perusahaan untuk deep linking (jika belum dihandle AppCore)
            // window.location.hash = `page-company-detail?id=${companyId}`;
        } else {
            UI.showElement(PageCompanyDetail.errorMessageDiv, 'block');
            PageCompanyDetail.errorMessageDiv.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${UI.escapeHTML(response.message || 'Gagal memuat detail perusahaan.')}</p>`;
            document.title = `${window.sikmaApp.appName || 'SIKMA'} - Error Memuat Data`;
        }
    },
    
    resetPageVisuals: () => { // Mirip resetPage tapi tidak null-kan currentCompanyId
        if (PageCompanyDetail.contentContainer) UI.hideElement(PageCompanyDetail.contentContainer);
        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator);
        if (PageCompanyDetail.errorMessageDiv) UI.hideElement(PageCompanyDetail.errorMessageDiv);
    },

    _populateCompanyData: (companyData) => {
        if (!PageCompanyDetail.companyNameEl) { 
            console.error("PageCompanyDetail: Detail elements not initialized properly for population.");
            return;
        }
        const defaultAvatar = window.sikmaApp?.baseUrl + '/assets/images/default_avatar.png';
        const defaultBanner = 'https://placehold.co/800x380/eee/ccc?text=Banner+Perusahaan';
        const defaultLogo = 'https://placehold.co/100x100/ccc/999?text=Logo';

        PageCompanyDetail.companyNameEl.textContent = UI.escapeHTML(companyData.name || 'Nama Tidak Tersedia');
        
        if(PageCompanyDetail.companyCategoryTagEl) {
            PageCompanyDetail.companyCategoryTagEl.textContent = UI.escapeHTML(companyData.category || 'Kategori');
            const tagClass = `tag-${(companyData.category || 'lainnya').toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/&/g, 'and')}`;
            PageCompanyDetail.companyCategoryTagEl.className = `category-tag ${tagClass}`;
        }
        if(PageCompanyDetail.companyTypeEl) PageCompanyDetail.companyTypeEl.textContent = UI.escapeHTML(companyData.type || 'Tipe');
        
        if(PageCompanyDetail.companyLogoEl) {
            PageCompanyDetail.companyLogoEl.src = companyData.logo_url || defaultLogo;
            PageCompanyDetail.companyLogoEl.alt = companyData.name ? `Logo ${UI.escapeHTML(companyData.name)}` : 'Logo Perusahaan';
            PageCompanyDetail.companyLogoEl.onerror = () => { PageCompanyDetail.companyLogoEl.src = defaultLogo; };
        }
        if(PageCompanyDetail.companyBannerImgEl) {
            PageCompanyDetail.companyBannerImgEl.src = companyData.image_url || defaultBanner;
            PageCompanyDetail.companyBannerImgEl.alt = companyData.name ? `Banner ${UI.escapeHTML(companyData.name)}` : 'Banner Perusahaan';
            PageCompanyDetail.companyBannerImgEl.onerror = () => { PageCompanyDetail.companyBannerImgEl.src = defaultBanner; };
        }
        
        if(PageCompanyDetail.companyLongDescriptionEl) {
            PageCompanyDetail.companyLongDescriptionEl.innerHTML = (companyData.long_description || 'Deskripsi tidak tersedia.').replace(/\n/g, '<br>');
        }

        // Populate Relevant Tech/Skills
        if (PageCompanyDetail.companyRelevantTechContainer && PageCompanyDetail.companyRelevantTechSection) {
            PageCompanyDetail.companyRelevantTechContainer.innerHTML = ''; // Clear
            if (companyData.relevant_tech && Array.isArray(companyData.relevant_tech) && companyData.relevant_tech.length > 0) {
                companyData.relevant_tech.forEach(tech => {
                    const tag = document.createElement('span');
                    tag.className = 'tech-tag';
                    tag.textContent = UI.escapeHTML(tech);
                    PageCompanyDetail.companyRelevantTechContainer.appendChild(tag);
                });
                UI.showElement(PageCompanyDetail.companyRelevantTechSection, 'block');
            } else {
                UI.hideElement(PageCompanyDetail.companyRelevantTechSection);
            }
        }
        
        if(PageCompanyDetail.companyAddressEl) PageCompanyDetail.companyAddressEl.textContent = UI.escapeHTML(companyData.address || 'Alamat tidak tersedia');
        
        const setupContactLink = (linkEl, itemEl, value, type) => {
            if (value && value.trim() !== '' && value.trim() !== '#') {
                linkEl.textContent = UI.escapeHTML(value);
                if (type === 'website') linkEl.href = value.startsWith('http') ? value : `https://${value}`;
                else if (type === 'email') linkEl.href = `mailto:${value}`;
                UI.showElement(itemEl, 'flex'); // Karena <li> di CSS pakai flex
            } else {
                UI.hideElement(itemEl);
            }
        };
        setupContactLink(PageCompanyDetail.companyWebsiteLinkEl, PageCompanyDetail.companyWebsiteItemEl, companyData.website, 'website');
        setupContactLink(PageCompanyDetail.companyEmailLinkEl, PageCompanyDetail.companyEmailItemEl, companyData.email, 'email');

        if(PageCompanyDetail.companyPhoneEl && PageCompanyDetail.companyPhoneItemEl) {
            if (companyData.phone && companyData.phone.trim() !== '') {
                PageCompanyDetail.companyPhoneEl.textContent = UI.escapeHTML(companyData.phone);
                UI.showElement(PageCompanyDetail.companyPhoneItemEl, 'flex');
            } else {
                UI.hideElement(PageCompanyDetail.companyPhoneItemEl);
            }
        }

        if(PageCompanyDetail.whyInternCompanyNameEl) PageCompanyDetail.whyInternCompanyNameEl.textContent = UI.escapeHTML(companyData.name || 'Perusahaan Ini');
        
        if(PageCompanyDetail.whyInternListEl) {
            PageCompanyDetail.whyInternListEl.innerHTML = ''; // Clear previous
            if (companyData.why_intern_here && Array.isArray(companyData.why_intern_here) && companyData.why_intern_here.length > 0) {
                companyData.why_intern_here.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = UI.escapeHTML(point);
                    PageCompanyDetail.whyInternListEl.appendChild(li);
                });
            } else {
                PageCompanyDetail.whyInternListEl.innerHTML = '<li>Informasi tidak tersedia saat ini.</li>';
            }
        }

        if(PageCompanyDetail.internshipInfoEl) {
            PageCompanyDetail.internshipInfoEl.innerHTML = (companyData.internship_application_info || 'Informasi lebih lanjut mengenai proses lamaran magang dapat ditanyakan langsung ke perusahaan terkait.').replace(/\n/g, '<br>');
        }
    }
};

// Panggil initialize dasar saat script dimuat.
// Data akan dimuat saat displayCompanyDetails dipanggil.
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan hanya inisialisasi jika elemen page-company-detail ada di DOM
    // Ini mencegah error jika script ini dimuat di halaman lain (meskipun seharusnya tidak)
    if (UI.getElement('#page-company-detail')) {
        PageCompanyDetail.initialize();
    }
});
