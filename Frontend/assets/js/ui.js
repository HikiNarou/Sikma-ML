// SikmaV3 - assets/js/ui.js (Diperbarui)

const UI = {
    // DOM Element Selectors
    getElement: (selector) => document.querySelector(selector),
    getAllElements: (selector) => document.querySelectorAll(selector),

    // Message Display
    /**
     * Shows a message in a specified div.
     * @param {string|HTMLElement} targetDivOrSelector - The div element or its selector.
     * @param {string|object} messageOrErrors - The message string or an error object {field: [messages]}.
     * @param {'success'|'error'|'info'|'warning'} type - The type of message.
     * @param {number} autoHideDelay - Delay in ms to auto-hide. 0 for no auto-hide.
     */
    showMessage: (targetDivOrSelector, messageOrErrors, type = 'info', autoHideDelay = 5000) => {
        const div = typeof targetDivOrSelector === 'string' ? UI.getElement(targetDivOrSelector) : targetDivOrSelector;
        if (!div) {
            console.warn('UI.showMessage: Target div not found:', targetDivOrSelector);
            // Fallback to alert for critical messages if target div not found
            if (type === 'error' || type === 'success') {
                const alertMessage = typeof messageOrErrors === 'string' ? messageOrErrors : Object.values(messageOrErrors).flat().join('\n');
                alert(`${type.toUpperCase()}: ${alertMessage}`);
            }
            return;
        }

        div.className = 'auth-message'; // Reset classes
        div.classList.add(type); // Add success, error, info, or warning class
        
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        else if (type === 'error') iconClass = 'fas fa-exclamation-triangle';
        else if (type === 'warning') iconClass = 'fas fa-exclamation-circle';
        
        let messageHTML = `<i class="${iconClass}"></i> `;
        if (typeof messageOrErrors === 'string') {
            messageHTML += UI.escapeHTML(messageOrErrors);
        } else if (typeof messageOrErrors === 'object' && messageOrErrors !== null) {
            // Handle error object: { field: ["message1", "message2"], general: ["general message"] }
            // Or simple message: { message: "Some error" }
            if (messageOrErrors.message && Object.keys(messageOrErrors).length === 1) {
                 messageHTML += UI.escapeHTML(messageOrErrors.message);
            } else {
                messageHTML += "Harap perbaiki kesalahan berikut:<ul>";
                for (const field in messageOrErrors) {
                    if (Array.isArray(messageOrErrors[field])) {
                        messageOrErrors[field].forEach(msg => {
                            messageHTML += `<li>${UI.escapeHTML(msg)}</li>`;
                        });
                    } else {
                         messageHTML += `<li>${UI.escapeHTML(messageOrErrors[field])}</li>`; // Fallback for non-array error
                    }
                }
                messageHTML += "</ul>";
            }
        }


        div.innerHTML = messageHTML;
        div.style.display = 'flex'; // auth-message uses flex
        div.style.opacity = 1;

        if (div.hideTimeout) clearTimeout(div.hideTimeout); // Clear existing timeout
        if (autoHideDelay > 0) {
            div.hideTimeout = setTimeout(() => {
                UI.hideMessage(div);
            }, autoHideDelay);
        }
    },

    hideMessage: (targetDivOrSelector) => {
        const div = typeof targetDivOrSelector === 'string' ? UI.getElement(targetDivOrSelector) : targetDivOrSelector;
        if (div && div.style.display !== 'none') {
            div.style.opacity = 0;
            setTimeout(() => {
                div.style.display = 'none';
                div.innerHTML = ''; // Clear content after hiding
                if (div.hideTimeout) clearTimeout(div.hideTimeout);
            }, 300); // Match animation duration
        }
    },

    // Modal Management
    openModal: (modalId) => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent body scroll
            // Focus on the first focusable element in the modal
            const firstFocusable = modal.querySelector('input:not([type="hidden"]), select, button, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 50); // Timeout to ensure modal is visible
            }
        } else {
            console.warn(`Modal with ID "${modalId}" not found.`);
        }
    },

    closeModal: (modalId) => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore body scroll
        }
    },

    setModalTitle: (modalId, title, iconClass = 'fas fa-info-circle') => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            const titleElement = modal.querySelector('.modal-header h3');
            if (titleElement) {
                titleElement.innerHTML = `<i class="${iconClass}"></i> ${UI.escapeHTML(title)}`;
            }
        }
    },
    
    // Form Handling
    resetForm: (formOrSelector) => {
        const form = typeof formOrSelector === 'string' ? UI.getElement(formOrSelector) : formOrSelector;
        if (form && typeof form.reset === 'function') {
            form.reset();
            // Clear any validation messages or states if custom validation is used
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            form.querySelectorAll('.form-error-text').forEach(el => el.remove());
        }
    },

    setFormDisabled: (formOrSelector, disabled) => {
        const form = typeof formOrSelector === 'string' ? UI.getElement(formOrSelector) : formOrSelector;
        if (form) {
            const elements = form.elements;
            for (let i = 0; i < elements.length; i++) {
                // Disable all input, select, textarea, button elements
                if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(elements[i].tagName)) {
                    elements[i].disabled = disabled;
                }
            }
        }
    },

    // Element Visibility & Class Toggling
    showElement: (elementOrSelector, displayType = 'block') => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.style.display = displayType;
    },

    hideElement: (elementOrSelector) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.style.display = 'none';
    },

    toggleClass: (elementOrSelector, className, force) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.classList.toggle(className, force);
    },

    addClass: (elementOrSelector, className) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.classList.add(className);
    },

    removeClass: (elementOrSelector, className) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.classList.remove(className);
    },

    // Update User Interface (Shared elements like header)
    updateSharedUserUI: (userData) => {
        const sharedUserName = UI.getElement('#sharedUserName');
        const sharedAvatarPreview = UI.getElement('#sharedAvatarPreview');
        
        const displayName = userData?.nama_lengkap || 'Pengguna';
        const defaultAvatar = window.sikmaApp?.baseUrl + '/assets/images/default_avatar.png'; // Path ke avatar default
        const displayAvatar = userData?.avatar || defaultAvatar;

        if (sharedUserName) sharedUserName.textContent = UI.escapeHTML(displayName);
        if (sharedAvatarPreview) {
            sharedAvatarPreview.src = displayAvatar;
            sharedAvatarPreview.alt = `Avatar ${UI.escapeHTML(displayName)}`;
            sharedAvatarPreview.onerror = () => { sharedAvatarPreview.src = defaultAvatar; }; // Fallback jika avatar gagal dimuat
        }
    },

    resetSharedUserUI: () => {
        const sharedUserName = UI.getElement('#sharedUserName');
        const sharedAvatarPreview = UI.getElement('#sharedAvatarPreview');
        const defaultAvatar = window.sikmaApp?.baseUrl + '/assets/images/default_avatar.png';
        if (sharedUserName) sharedUserName.textContent = 'Nama Mahasiswa';
        if (sharedAvatarPreview) {
            sharedAvatarPreview.src = defaultAvatar;
            sharedAvatarPreview.alt = 'Avatar Pengguna';
        }
    },

    // Spinner/Loading indication
    showButtonSpinner: (buttonElement, originalText = null, loadingText = 'Memuat...') => {
        if (!buttonElement) return;
        if (originalText !== null) { // Allow passing explicit original text
            buttonElement.dataset.originalText = originalText;
        } else if (!buttonElement.dataset.originalText) {
            buttonElement.dataset.originalText = buttonElement.innerHTML;
        }
        buttonElement.disabled = true;
        buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${UI.escapeHTML(loadingText)}`;
    },

    hideButtonSpinner: (buttonElement) => {
        if (!buttonElement) return;
        buttonElement.disabled = false;
        if (buttonElement.dataset.originalText) {
            buttonElement.innerHTML = buttonElement.dataset.originalText;
        }
        // delete buttonElement.dataset.originalText; // Opsional: hapus setelah restore
    },

    /**
     * Creates and returns a generic item tag element.
     * @param {string} name - The main text of the tag.
     * @param {string} [details] - Optional details text.
     * @param {string} [iconClass] - Optional FontAwesome icon class for the tag.
     * @param {string} [itemId] - Optional ID for the item, stored in dataset.
     * @param {boolean} [canEdit=true] - Whether to show an edit button.
     * @param {boolean} [canDelete=true] - Whether to show a delete button.
     * @returns {HTMLElement} The created item tag element.
     */
    createItemTag: (name, details = '', iconClass = '', itemId = '', canEdit = true, canDelete = true) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-tag';
        if (itemId) itemDiv.dataset.itemId = itemId;
        // Store original data in dataset for editing purposes
        itemDiv.dataset.itemName = name; 
        if (details) itemDiv.dataset.itemDetails = details;

        let html = '';
        if (iconClass) {
            html += `<i class="${iconClass} item-icon"></i> `;
        }
        html += `<span class="item-name">${UI.escapeHTML(name)}</span>`;
        if (details) {
            html += ` <span class="item-details">(${UI.escapeHTML(details)})</span>`;
        }
        
        html += '<div class="item-actions">';
        if (canEdit) {
            html += `<button type="button" class="item-action-btn edit-item" aria-label="Edit item ${UI.escapeHTML(name)}"><i class="fas fa-pencil-alt"></i></button>`;
        }
        if (canDelete) {
            html += `<button type="button" class="item-action-btn remove-item" aria-label="Hapus item ${UI.escapeHTML(name)}"><i class="fas fa-times"></i></button>`;
        }
        html += '</div>';

        itemDiv.innerHTML = html;
        return itemDiv;
    },

    escapeHTML: (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;' // atau &apos;
            }[match];
        });
    },

    /**
     * Populates a select dropdown with options.
     * @param {string|HTMLSelectElement} selectOrSelector - The select element or its selector.
     * @param {Array<object>|Array<string>} optionsArray - Array of option objects {value: '', text: ''} or strings.
     * @param {string} [selectedValue] - Optional: The value to be pre-selected.
     * @param {string} [placeholderText] - Optional: Text for a default, non-selectable placeholder option.
     */
    populateSelectWithOptions: (selectOrSelector, optionsArray, selectedValue = null, placeholderText = "Pilih...") => {
        const selectElement = typeof selectOrSelector === 'string' ? UI.getElement(selectOrSelector) : selectOrSelector;
        if (!selectElement || selectElement.tagName !== 'SELECT') {
            console.warn("UI.populateSelectWithOptions: Invalid select element provided.");
            return;
        }

        selectElement.innerHTML = ''; // Clear existing options

        if (placeholderText) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = "";
            placeholderOption.textContent = placeholderText;
            placeholderOption.disabled = true; // Placeholder tidak bisa dipilih jika sudah ada opsi lain
            placeholderOption.selected = !selectedValue; // Terpilih jika tidak ada selectedValue
            selectElement.appendChild(placeholderOption);
        }

        optionsArray.forEach(opt => {
            const option = document.createElement('option');
            if (typeof opt === 'object' && opt !== null && opt.hasOwnProperty('value') && opt.hasOwnProperty('text')) {
                option.value = opt.value;
                option.textContent = opt.text;
            } else { // Array of strings
                option.value = opt;
                option.textContent = opt;
            }
            if (selectedValue !== null && String(option.value) === String(selectedValue)) {
                option.selected = true;
                if(placeholderText && selectElement.options[0].value === "") selectElement.options[0].selected = false; // Deselect placeholder
            }
            selectElement.appendChild(option);
        });
    }
};

// Global event listener for closing modals
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') { // Handle 'Esc' too
            const openModal = UI.getElement('.modal.show');
            if (openModal) {
                UI.closeModal(openModal.id);
            }
        }
    });

    document.body.addEventListener('click', (event) => {
        // Close modal if backdrop is clicked
        if (event.target.classList.contains('modal') && event.target.classList.contains('show')) {
            UI.closeModal(event.target.id);
        }
        // Close modal if a close button (header or footer) is clicked
        const closeButton = event.target.closest('.close-btn, .close-btn-footer');
        if (closeButton) {
            const modalId = closeButton.dataset.modalId; // Assuming buttons have data-modal-id
            if (modalId) {
                 const modalToClose = UI.getElement(`#${modalId}`);
                 if (modalToClose && modalToClose.classList.contains('show')) {
                    UI.closeModal(modalId);
                }
            } else { // Fallback if no data-modal-id, try to find closest modal
                const modalToClose = event.target.closest('.modal');
                if (modalToClose && modalToClose.classList.contains('show')) {
                    UI.closeModal(modalToClose.id);
                }
            }
        }
    });
});
