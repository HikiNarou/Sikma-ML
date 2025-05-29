// SikmaV3 - assets/js/page_profile.js (Diperbarui)

const PageProfile = {
    // DOM Elements
    profileForm: null,
    profilePageMessageDiv: null,
    saveProfileDataBtn: null,
    
    // Basic Info Elements
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,
    nimInput: null,
    semesterSelect: null, 
    ipkInput: null,       
    bioInput: null,
    avatarPreviewPage: null,
    avatarUploadInput: null,
    kotaAsalInput: null,    
    kecamatanInput: null,   
    kelurahanInput: null,   

    // Item List Containers
    itemLists: {
        programmingSkill: null,
        framework: null,
        tool: null,            
        otherSkill: null,
        education: null,
        experience: null,
        socialLink: null,
        industryPreference: null 
    },
    addItemButtons: null,

    // Modal Elements
    itemEntryModal: null,
    itemEntryForm: null,
    itemModalTitle: null,
    itemTypeInputModal: null, 
    itemIdInputModal: null,   
    modalSpecificFieldsContainer: null,
    itemModalMessageDiv: null,
    modalTemplatesContainer: null, // Kontainer baru untuk template

    // State
    currentProfileData: { 
        programmingSkill: [],
        framework: [],
        tool: [],
        otherSkill: [],
        education: [],
        experience: [],
        socialLink: [],
        industryPreference: [],
    }, 
    isEditingItem: false,
    editingItemId: null, 
    isPageInitialized: false,
    
    // Konfigurasi untuk setiap tipe item dinamis
    itemTypeConfigs: {
        programmingSkill: { 
            listElementId: 'programmingSkillsListProfile', 
            modalTitle: 'Bahasa Pemrograman', 
            icon: 'fas fa-code',
            fieldsTemplateId: 'skillFieldsTemplate', 
            genericNameFieldInTemplate: 'modal_item_generic_name', // ID input nama generik di template
            dbNameField: 'skill_name', 
            fields: ['skill_name', 'skill_level', 'experience_duration'] 
        },
        framework: { 
            listElementId: 'frameworksListProfile', 
            modalTitle: 'Framework', 
            icon: 'fas fa-cubes',
            fieldsTemplateId: 'skillFieldsTemplate',
            genericNameFieldInTemplate: 'modal_item_generic_name',
            dbNameField: 'framework_name',
            fields: ['framework_name', 'skill_level', 'experience_duration']
        },
        tool: { 
            listElementId: 'toolsListProfile',
            modalTitle: 'Tool',
            icon: 'fas fa-tools', // Ikon disesuaikan
            fieldsTemplateId: 'skillFieldsTemplate', 
            genericNameFieldInTemplate: 'modal_item_generic_name',
            dbNameField: 'tool_name',
            fields: ['tool_name', 'skill_level', 'experience_duration']
        },
        otherSkill: { 
            listElementId: 'otherSkillsListProfile', 
            modalTitle: 'Keahlian Lain', 
            icon: 'fas fa-puzzle-piece', 
            fieldsTemplateId: 'skillFieldsTemplate',
            genericNameFieldInTemplate: 'modal_item_generic_name',
            dbNameField: 'skill_name',
            fields: ['skill_name', 'skill_level', 'experience_duration']
        },
        education: { 
            listElementId: 'educationListProfile', 
            modalTitle: 'Riwayat Pendidikan', 
            icon: 'fas fa-graduation-cap',
            fieldsTemplateId: 'educationFieldsTemplate',
            // Untuk education, 'institution_name' adalah field utama, bukan generik
            nameFieldInTemplate: 'modal_institution_name', // ID input nama institusi di template education
            dbNameField: 'institution_name',
            fields: ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description']
        },
        experience: { 
            listElementId: 'experienceListProfile', 
            modalTitle: 'Pengalaman Kerja/Proyek', 
            icon: 'fas fa-briefcase',
            fieldsTemplateId: 'experienceFieldsTemplate',
            nameFieldInTemplate: 'modal_company_name',
            dbNameField: 'company_name',
            fields: ['company_name', 'job_title', 'start_date', 'end_date', 'description']
        },
        socialLink: {
            listElementId: 'socialLinksListProfile',
            modalTitle: 'Link Sosial Media/Portfolio',
            icon: 'fas fa-link',
            fieldsTemplateId: 'socialLinkFieldsTemplate',
            nameFieldInTemplate: 'modal_platform_name', 
            dbNameField: 'platform_name', 
            fields: ['platform_name', 'url']
        },
        industryPreference: { 
            listElementId: 'industryPreferencesListProfile',
            modalTitle: 'Preferensi Bidang Industri',
            icon: 'fas fa-industry',
            fieldsTemplateId: 'industryPreferenceFieldsTemplate',
            nameFieldInTemplate: 'modal_industry_name',
            dbNameField: 'industry_name',
            fields: ['industry_name'] 
        }
    },

    initialize: () => {
        if (PageProfile.isPageInitialized) return;
        console.log("PageProfile: Initializing...");

        PageProfile.profileForm = UI.getElement('#fullProfileForm');
        PageProfile.profilePageMessageDiv = UI.getElement('#profilePageMessage');
        PageProfile.saveProfileDataBtn = UI.getElement('#saveProfileDataBtn');

        PageProfile.firstNameInput = UI.getElement('#profile_firstName');
        PageProfile.lastNameInput = UI.getElement('#profile_lastName');
        PageProfile.emailInput = UI.getElement('#profile_email');
        PageProfile.nimInput = UI.getElement('#profile_nim');
        PageProfile.semesterSelect = UI.getElement('#profile_semester');
        PageProfile.ipkInput = UI.getElement('#profile_ipk');
        PageProfile.bioInput = UI.getElement('#profile_bio');
        PageProfile.avatarPreviewPage = UI.getElement('#profile_avatarPreviewPage');
        PageProfile.avatarUploadInput = UI.getElement('#profile_avatarUpload');
        PageProfile.kotaAsalInput = UI.getElement('#profile_kota_asal');
        PageProfile.kecamatanInput = UI.getElement('#profile_kecamatan');
        PageProfile.kelurahanInput = UI.getElement('#profile_kelurahan');

        for (const type in PageProfile.itemTypeConfigs) {
            const config = PageProfile.itemTypeConfigs[type];
            PageProfile.itemLists[type] = UI.getElement(`#${config.listElementId}`);
        }
        PageProfile.addItemButtons = UI.getAllElements('.add-item-btn');

        PageProfile.itemEntryModal = UI.getElement('#itemEntryModal');
        PageProfile.itemEntryForm = UI.getElement('#itemEntryForm');
        PageProfile.itemModalTitle = UI.getElement('#itemModalTitle');
        PageProfile.itemTypeInputModal = UI.getElement('#itemType'); 
        PageProfile.itemIdInputModal = UI.getElement('#itemId');     
        PageProfile.modalSpecificFieldsContainer = UI.getElement('#modalSpecificFieldsContainer');
        PageProfile.itemModalMessageDiv = UI.getElement('#itemModalMessage');
        PageProfile.modalTemplatesContainer = UI.getElement('#modalTemplatesContainer'); // Cache kontainer template

        if (!PageProfile.profileForm || !PageProfile.saveProfileDataBtn || !PageProfile.modalTemplatesContainer) {
            console.error("PageProfile: Critical elements (form, save button, or modal templates container) not found. Aborting further initialization.");
            return;
        }
        
        PageProfile.profileForm.addEventListener('submit', PageProfile.handleSaveFullProfile);
        
        if (PageProfile.avatarUploadInput && PageProfile.avatarPreviewPage) {
            PageProfile.avatarUploadInput.addEventListener('change', PageProfile.handleAvatarPreview);
        }

        PageProfile._initAddItemButtons();
        PageProfile._initModalFormSubmit();
        
        PageProfile.isPageInitialized = true;
        console.log("PageProfile: Basic initialization complete.");
    },

    loadPageData: async () => {
        console.log("PageProfile: Loading page data...");
        if (!PageProfile.isPageInitialized) {
            PageProfile.initialize();
        }
        if(!PageProfile.profileForm) return; // Jika inisialisasi gagal, jangan lanjutkan

        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Simpan Semua Data Profil', 'Memuat Data...');
        
        const response = await Api.getProfileData();
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success' && response.data) {
            PageProfile.currentProfileData = { ...PageProfile.currentProfileData, ...response.data }; 
            PageProfile._populateFullProfileForm(response.data);
        } else {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Gagal memuat data profil.', 'error');
            if (window.sikmaApp && window.sikmaApp.initialUserData) {
                 PageProfile._populateFullProfileForm(window.sikmaApp.initialUserData);
            }
        }
    },
    
    _populateFullProfileForm: (userData) => {
        if (!userData || !PageProfile.profileForm) return;
        
        const nameParts = (userData.nama_lengkap || '').split(' ');
        if (PageProfile.firstNameInput) PageProfile.firstNameInput.value = userData.firstName || nameParts[0] || '';
        if (PageProfile.lastNameInput) PageProfile.lastNameInput.value = userData.lastName || nameParts.slice(1).join(' ') || '';
        if (PageProfile.emailInput) PageProfile.emailInput.value = userData.email || '';
        if (PageProfile.nimInput) PageProfile.nimInput.value = userData.nim || '';
        if (PageProfile.semesterSelect) PageProfile.semesterSelect.value = userData.semester || '';
        if (PageProfile.ipkInput) PageProfile.ipkInput.value = userData.ipk || '';
        if (PageProfile.bioInput) PageProfile.bioInput.value = userData.bio || '';
        if (PageProfile.avatarPreviewPage) {
            PageProfile.avatarPreviewPage.src = userData.avatar || (window.sikmaApp.baseUrl + '/assets/images/default_avatar.png');
            PageProfile.avatarPreviewPage.onerror = () => { PageProfile.avatarPreviewPage.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';};
        }
        if (PageProfile.kotaAsalInput) PageProfile.kotaAsalInput.value = userData.kota_asal || '';
        if (PageProfile.kecamatanInput) PageProfile.kecamatanInput.value = userData.kecamatan || '';
        if (PageProfile.kelurahanInput) PageProfile.kelurahanInput.value = userData.kelurahan || '';

        for (const itemType in PageProfile.itemTypeConfigs) {
            const items = userData[itemType] || [];
            PageProfile.currentProfileData[itemType] = [...items]; 
            PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
        }
    },

    resetPage: () => {
        console.log("PageProfile: Resetting page...");
        if (PageProfile.profileForm) UI.resetForm(PageProfile.profileForm);
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        if (PageProfile.avatarPreviewPage) PageProfile.avatarPreviewPage.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';
        
        for (const type in PageProfile.itemLists) {
            if (PageProfile.itemLists[type]) PageProfile.itemLists[type].innerHTML = '';
        }
        PageProfile.currentProfileData = {
            programmingSkill: [], framework: [], tool: [], otherSkill: [],
            education: [], experience: [], socialLink: [], industryPreference: []
        };
    },

    handleAvatarPreview: (event) => {
        const file = event.target.files[0];
        if (file && PageProfile.avatarPreviewPage) {
            if (file.size > 5 * 1024 * 1024) { 
                UI.showMessage(PageProfile.profilePageMessageDiv, 'Ukuran file avatar terlalu besar (Maks 5MB).', 'error');
                event.target.value = ""; 
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                UI.showMessage(PageProfile.profilePageMessageDiv, 'Format file avatar tidak valid (hanya JPG, PNG, GIF).', 'error');
                event.target.value = ""; 
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                PageProfile.avatarPreviewPage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    },

    _initAddItemButtons: () => {
        PageProfile.addItemButtons.forEach(button => {
            button.removeEventListener('click', PageProfile._handleAddItemButtonClick); 
            button.addEventListener('click', PageProfile._handleAddItemButtonClick);
        });
    },
    _handleAddItemButtonClick: function() { 
        const itemType = this.dataset.type;
        const config = PageProfile.itemTypeConfigs[itemType];
        if (config) {
            PageProfile.openItemModal(itemType, config.modalTitle, config.icon);
        } else {
            console.error("Config not found for item type:", itemType);
        }
    },
    
    openItemModal: (itemType, title, icon, itemDataToEdit = null, clientOrDbId = null) => {
        PageProfile.isEditingItem = !!itemDataToEdit;
        PageProfile.editingItemId = PageProfile.isEditingItem ? clientOrDbId : null;

        UI.resetForm(PageProfile.itemEntryForm);
        if (PageProfile.itemModalMessageDiv) UI.hideMessage(PageProfile.itemModalMessageDiv);

        PageProfile.itemTypeInputModal.value = itemType;
        PageProfile.itemIdInputModal.value = PageProfile.editingItemId || ''; 
        UI.setModalTitle('itemEntryModal', PageProfile.isEditingItem ? `Edit ${title}` : `Tambah ${title}`, icon);

        PageProfile.modalSpecificFieldsContainer.innerHTML = ''; 
        const config = PageProfile.itemTypeConfigs[itemType];

        if (config && config.fieldsTemplateId && PageProfile.modalTemplatesContainer) {
            const templateSource = PageProfile.modalTemplatesContainer.querySelector(`#${config.fieldsTemplateId}`);
            if (templateSource) {
                const clone = templateSource.cloneNode(true);
                // clone.removeAttribute('id'); // Hapus ID dari clone agar tidak duplikat di DOM utama jika template tetap di sana
                clone.style.display = 'block'; 
                PageProfile.modalSpecificFieldsContainer.appendChild(clone);

                const formElements = PageProfile.itemEntryForm.elements;

                if (PageProfile.isEditingItem && itemDataToEdit) {
                    // Populate field nama utama (bisa generik atau spesifik)
                    const nameInputKey = config.genericNameFieldInTemplate || config.nameFieldInTemplate;
                    if (formElements[nameInputKey]) { // Cek berdasarkan ID field di template
                         formElements[nameInputKey].value = itemDataToEdit[config.dbNameField] || '';
                    } else if (formElements[config.dbNameField]) { // Fallback cek berdasarkan nama field DB (jika name attr di HTML = dbNameField)
                         formElements[config.dbNameField].value = itemDataToEdit[config.dbNameField] || '';
                    }


                    // Populate field spesifik lainnya dari config.fields
                    config.fields.forEach(fieldKey => {
                        // Jangan populate ulang nama utama jika sudah dihandle
                        if (fieldKey !== config.dbNameField && formElements[fieldKey] && itemDataToEdit[fieldKey] !== undefined) {
                           if (formElements[fieldKey].type === 'checkbox') {
                                formElements[fieldKey].checked = !!itemDataToEdit[fieldKey];
                            } else {
                                formElements[fieldKey].value = itemDataToEdit[fieldKey];
                            }
                        }
                    });
                }
            } else {
                console.error("Template source not found for ID:", config.fieldsTemplateId, "within modalTemplatesContainer.");
                 PageProfile.modalSpecificFieldsContainer.innerHTML = `<p class="text-danger">Error: Template modal untuk tipe item '${itemType}' tidak ditemukan.</p>`;
            }
        } else {
            let errorMsg = "Konfigurasi modal tidak lengkap.";
            if (!PageProfile.modalTemplatesContainer) errorMsg = "Kontainer template modal tidak ditemukan.";
            else if (!config.fieldsTemplateId) errorMsg = `Template ID tidak terdefinisi untuk tipe item '${itemType}'.`;
            
            console.error(errorMsg, "Config:", config);
            PageProfile.modalSpecificFieldsContainer.innerHTML = `<p class="text-danger">${errorMsg}</p>`;
        }
        UI.openModal('itemEntryModal');
    },

    _initModalFormSubmit: () => {
        if (PageProfile.itemEntryForm) {
            PageProfile.itemEntryForm.removeEventListener('submit', PageProfile._handleModalFormSubmit); 
            PageProfile.itemEntryForm.addEventListener('submit', PageProfile._handleModalFormSubmit);
        }
    },

    _handleModalFormSubmit: (e) => {
        e.preventDefault();
        const formData = new FormData(PageProfile.itemEntryForm);
        const rawItemData = Object.fromEntries(formData.entries()); 
        const itemType = rawItemData.itemType; 
        const clientOrDbId = rawItemData.itemId; 
        const config = PageProfile.itemTypeConfigs[itemType];

        if (!config) {
            UI.showMessage(PageProfile.itemModalMessageDiv, 'Tipe item tidak dikenal.', 'error');
            return;
        }
        
        const itemDataToStore = {};
        let mainNameValue = '';

        // Ambil nilai dari field nama generik jika ada, atau field nama spesifik
        if (config.genericNameFieldInTemplate && rawItemData['item_generic_name'] !== undefined) {
            mainNameValue = rawItemData['item_generic_name'].trim();
        } else if (rawItemData[config.dbNameField] !== undefined) { // Jika template menggunakan nama field DB langsung
            mainNameValue = rawItemData[config.dbNameField].trim();
        }

        if (mainNameValue === '') {
            UI.showMessage(PageProfile.itemModalMessageDiv, `Nama Item untuk ${config.modalTitle} wajib diisi.`, 'error');
            const nameInputId = config.genericNameFieldInTemplate || config.nameFieldInTemplate;
            const nameInputInModal = PageProfile.itemEntryForm.elements[nameInputId];
            if(nameInputInModal) nameInputInModal.focus();
            return;
        }
        
        itemDataToStore[config.dbNameField] = mainNameValue; // Set field nama utama

        // Proses field lain
        config.fields.forEach(fieldKey => {
            if (fieldKey !== config.dbNameField) { // Hindari menimpa field nama utama yang sudah di-set
                itemDataToStore[fieldKey] = rawItemData[fieldKey] !== undefined ? rawItemData[fieldKey] : null;
            }
        });


        if (PageProfile.isEditingItem && clientOrDbId) {
            itemDataToStore.id = clientOrDbId; 
            PageProfile._updateItemInDataStore(itemType, itemDataToStore, clientOrDbId);
        } else {
            const tempClientId = `${itemType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            itemDataToStore.client_id = tempClientId; 
            PageProfile._addItemToDataStore(itemType, itemDataToStore);
        }
        
        PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
        UI.closeModal('itemEntryModal');
    },

    _addItemToDataStore: (itemType, itemData) => {
        if (!PageProfile.currentProfileData[itemType]) {
            PageProfile.currentProfileData[itemType] = [];
        }
        PageProfile.currentProfileData[itemType].push(itemData);
    },

    _updateItemInDataStore: (itemType, newItemData, idToUpdate) => {
        const itemIndex = PageProfile.currentProfileData[itemType].findIndex(item => 
            (item.id && String(item.id) === String(idToUpdate)) || 
            (item.client_id && item.client_id === idToUpdate)
        );
        if (itemIndex > -1) {
            const oldItem = PageProfile.currentProfileData[itemType][itemIndex];
            PageProfile.currentProfileData[itemType][itemIndex] = { ...oldItem, ...newItemData };
        } else {
            console.warn("Item not found in data store for update:", idToUpdate, "Type:", itemType);
        }
    },
    
    _removeItemFromDataStoreAndDOM: (itemType, itemIdToRemove) => {
        const itemIndex = PageProfile.currentProfileData[itemType].findIndex(item => 
            (item.id && String(item.id) === String(itemIdToRemove)) || 
            (item.client_id && item.client_id === itemIdToRemove)
        );
        
        if (itemIndex > -1) {
            PageProfile.currentProfileData[itemType].splice(itemIndex, 1);
            PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]); 
        } else {
            console.warn("Item not found for removal:", itemIdToRemove, "Type:", itemType);
            const listElement = PageProfile.itemLists[itemType];
            const itemTag = listElement ? listElement.querySelector(`.item-tag[data-item-id="${itemIdToRemove}"]`) : null;
            if (itemTag) itemTag.remove();
        }
    },
    
    _populateDynamicList: (itemType, itemsArray) => {
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) {
            console.warn("Cannot populate list for item type:", itemType, "List element or config missing.");
            return;
        }

        listElement.innerHTML = ''; 
        if (itemsArray && itemsArray.length > 0) {
            itemsArray.forEach(item => {
                const displayId = item.id || item.client_id; 
                PageProfile._addItemToDOM(itemType, item, displayId);
            });
        }
    },

    _addItemToDOM: (itemType, itemData, displayId) => {
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) return;

        const mainName = itemData[config.dbNameField] || 'N/A';
        let detailsString = PageProfile._getDetailsStringForItem(itemType, itemData, config);
        
        const itemTag = UI.createItemTag(mainName, detailsString, config.icon, displayId);
        
        const editBtn = itemTag.querySelector('.edit-item');
        const removeBtn = itemTag.querySelector('.remove-item');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const fullItemData = PageProfile.currentProfileData[itemType].find(item => 
                    (item.id && String(item.id) === String(displayId)) || 
                    (item.client_id && item.client_id === displayId)
                );
                if (fullItemData) {
                    PageProfile.openItemModal(itemType, config.modalTitle, config.icon, fullItemData, displayId);
                } else {
                    console.error("Could not find item data for edit:", displayId, "Type:", itemType);
                    UI.showMessage(PageProfile.profilePageMessageDiv, 'Gagal mengambil data item untuk diedit.', 'error');
                }
            });
        }
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                // Menggunakan konfirmasi UI yang lebih baik jika ada, atau window.confirm sebagai fallback
                const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus item "${UI.escapeHTML(mainName)}"? Tindakan ini tidak dapat dibatalkan setelah disimpan ke server.`);
                if (confirmDelete) {
                    PageProfile._removeItemFromDataStoreAndDOM(itemType, displayId);
                }
            });
        }
        listElement.appendChild(itemTag);
    },
    
    _getDetailsStringForItem: (itemType, itemData, config) => {
        let detailsString = "";
        switch (itemType) {
            case 'programmingSkill':
            case 'framework':
            case 'tool':
            case 'otherSkill':
                detailsString = itemData.skill_level ? `Level: ${itemData.skill_level}` : '';
                if (itemData.experience_duration) {
                    detailsString += (detailsString ? ', ' : '') + `Peng: ${itemData.experience_duration}`;
                }
                break;
            case 'education':
                detailsString = itemData.degree || '';
                if (itemData.field_of_study) detailsString += (detailsString ? ' di ' : '') + itemData.field_of_study;
                if (itemData.start_date || itemData.end_date) {
                    const start = itemData.start_date ? itemData.start_date.substring(0, 7).replace('-', '/') : ''; 
                    const end = itemData.end_date ? itemData.end_date.substring(0, 7).replace('-', '/') : 'Sekarang';
                    if (start || end !== 'Sekarang') detailsString += ` (${start} - ${end})`;
                }
                break;
            case 'experience':
                detailsString = itemData.job_title || '';
                if (itemData.start_date || itemData.end_date) {
                     const start = itemData.start_date ? itemData.start_date.substring(0, 7).replace('-', '/') : '';
                    const end = itemData.end_date ? itemData.end_date.substring(0, 7).replace('-', '/') : 'Sekarang';
                    if (start || end !== 'Sekarang') detailsString += ` (${start} - ${end})`;
                }
                break;
            case 'socialLink':
                detailsString = itemData.url ? itemData.url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : ''; 
                break;
            case 'industryPreference':
                detailsString = ""; 
                break;
        }
        return detailsString.trim();
    },

    handleSaveFullProfile: async (e) => {
        e.preventDefault();
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        
        if (!PageProfile.profileForm.checkValidity()) {
            PageProfile.profileForm.reportValidity(); 
            UI.showMessage(PageProfile.profilePageMessageDiv, 'Harap isi semua field yang wajib (*).', 'error');
            return;
        }

        UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Simpan Semua Data Profil', 'Menyimpan...');

        const profilePayload = {
            firstName: PageProfile.firstNameInput.value,
            lastName: PageProfile.lastNameInput.value,
            bio: PageProfile.bioInput.value,
            semester: PageProfile.semesterSelect.value,
            ipk: PageProfile.ipkInput.value,
            kota_asal: PageProfile.kotaAsalInput.value,
            kecamatan: PageProfile.kecamatanInput.value,
            kelurahan: PageProfile.kelurahanInput.value,
        };
        
        if (PageProfile.avatarUploadInput.files && PageProfile.avatarUploadInput.files[0]) {
            profilePayload.avatar = PageProfile.avatarUploadInput.files[0];
        }

        for (const itemType in PageProfile.itemTypeConfigs) {
            profilePayload[itemType] = JSON.stringify(PageProfile.currentProfileData[itemType] || []);
        }
        
        const response = await Api.saveFullProfileData(profilePayload);
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success') {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Data profil berhasil disimpan!', 'success');
            
            if (response.saved_item_ids) {
                for (const itemType in response.saved_item_ids) {
                    if (PageProfile.currentProfileData[itemType]) {
                        const idMap = response.saved_item_ids[itemType]; 
                        PageProfile.currentProfileData[itemType].forEach(item => {
                            if (item.client_id && idMap[item.client_id]) {
                                item.id = idMap[item.client_id];
                                delete item.client_id;
                            }
                        });
                    }
                }
            }
            if (response.user_data) { 
                window.sikmaApp.initialUserData = { ...window.sikmaApp.initialUserData, ...response.user_data };
                UI.updateSharedUserUI(window.sikmaApp.initialUserData);
                if (typeof PageSettings !== 'undefined' && PageSettings.isPageInitialized) {
                    PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
                }
                window.sikmaApp.needsProfileCompletion = !response.user_data.is_profile_complete;
                AuthFlow.checkInitialProfileCompletion(); 
            }
        } else {
            const errorMsg = response.errors ? response.errors : (response.message || 'Gagal menyimpan data profil.');
            UI.showMessage(PageProfile.profilePageMessageDiv, errorMsg, 'error');
        }
    }
};
