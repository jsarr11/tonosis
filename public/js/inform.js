// public/js/inform.js
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-inform-btn');
    const closeBtn = document.getElementById('close-inform-btn');
    const backdrop = document.getElementById('inform-backdrop');
    const listModal = document.getElementById('inform-modal');

    // edit modal elements
    const editModal = document.getElementById('inform-edit-modal');
    const editCloseBtn = document.getElementById('inform-edit-close-btn');
    const editNameInput = document.getElementById('inform-edit-name');
    const editErrorEl = document.getElementById('inform-edit-error');
    const editSaveBtn = document.getElementById('inform-edit-save-btn');
    const editDeleteBtn = document.getElementById('inform-edit-delete-btn');

    const searchInput = document.getElementById('inform-search');
    const listEl = document.getElementById('inform-list');
    const emptyEl = document.getElementById('inform-empty');

    const toggleAddBtn = document.getElementById('toggle-add-inform-btn');
    const addPanel = document.getElementById('add-inform-panel');
    const newNameInput = document.getElementById('new-inform-name');
    const saveBtn = document.getElementById('save-inform-btn');
    const addErrorEl = document.getElementById('add-inform-error');

    let allStatus = [];
    let loadedOnce = false;
    let currentStatus = null; // για το edit modal

    // ---------- HELPERS ----------
    function showBackdrop() {
        backdrop.classList.remove('hidden');
    }
    function hideBackdrop() {
        backdrop.classList.add('hidden');
    }

    function showListModal() {
        listModal.classList.remove('hidden');
    }
    function hideListModal() {
        listModal.classList.add('hidden');
    }

    function showEditModal() {
        editModal.classList.remove('hidden');
    }
    function hideEditModal() {
        editModal.classList.add('hidden');
    }

    // ---------- MAIN MODAL ----------
    function openModal() {
        showBackdrop();
        showListModal();
        hideEditModal();

        if (!loadedOnce) {
            loadStatus();
            loadedOnce = true;
        } else {
            renderStatus(searchInput.value.trim());
        }
    }

    function closeAll() {
        hideBackdrop();
        hideListModal();
        hideEditModal();
        currentStatus = null;
    }

    // ---------- LOAD ----------
    async function loadStatus() {
        try {
            const res = await fetch('/api/inform-status');
            const data = await res.json();

            if (!res.ok || !data.success) {
                console.error('Error loading inform_status:', data);
                allStatus = [];
            } else {
                allStatus = data.data || [];
            }

            renderStatus(searchInput.value.trim());
        } catch (err) {
            console.error(err);
            allStatus = [];
            renderStatus(searchInput.value.trim());
        }
    }

    // ---------- RENDER LIST ----------
    function renderStatus(filter) {
        const q = (filter || '').toLowerCase();
        listEl.innerHTML = '';

        const filtered = allStatus.filter(s =>
            !q || (s.description && s.description.toLowerCase().includes(q))
        );

        if (filtered.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }
        emptyEl.classList.add('hidden');

        filtered.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('client-item');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.description;

            li.appendChild(nameSpan);

            li.addEventListener('click', () => openInformEdit(item));

            listEl.appendChild(li);
        });
    }

    // ---------- CREATE ----------
    async function saveNewStatus() {
        const text = newNameInput.value.trim();
        addErrorEl.textContent = '';

        if (!text) {
            addErrorEl.textContent = 'Description required.';
            return;
        }

        try {
            const res = await fetch('/api/inform-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: text })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                addErrorEl.textContent = data.message || 'Error.';
                return;
            }

            allStatus.push(data.data);
            newNameInput.value = '';
            renderStatus(searchInput.value.trim());
        } catch (err) {
            console.error(err);
            addErrorEl.textContent = 'Network error.';
        }
    }

    // ---------- EDIT ----------
    function openInformEdit(item) {
        currentStatus = item;
        editErrorEl.textContent = '';

        editNameInput.value = item.description || '';

        // δείξε μόνο το edit modal πάνω στο ίδιο backdrop
        hideListModal();
        showEditModal();
        showBackdrop();
        editNameInput.focus();
    }

    async function saveEditedStatus() {
        if (!currentStatus) return;

        const newDesc = editNameInput.value.trim();
        editErrorEl.textContent = '';

        if (!newDesc) {
            editErrorEl.textContent = 'Description required.';
            return;
        }

        try {
            const res = await fetch(`/api/inform-status/${currentStatus.inform_status_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newDesc })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                editErrorEl.textContent = data.message || 'Error updating item.';
                return;
            }

            // update in memory
            const idx = allStatus.findIndex(
                s => s.inform_status_id === currentStatus.inform_status_id
            );
            if (idx !== -1) {
                allStatus[idx] = data.data;
            }

            currentStatus = null;
            hideEditModal();
            showListModal();
            renderStatus(searchInput.value.trim());
        } catch (err) {
            console.error(err);
            editErrorEl.textContent = 'Network error.';
        }
    }

    async function deleteCurrentStatus() {
        if (!currentStatus) return;
        const sure = window.confirm('Να διαγραφεί αυτό το inform status;');
        if (!sure) return;

        try {
            const res = await fetch(`/api/inform-status/${currentStatus.inform_status_id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                editErrorEl.textContent = data.message || 'Error deleting item.';
                return;
            }

            allStatus = allStatus.filter(
                s => s.inform_status_id !== currentStatus.inform_status_id
            );
            currentStatus = null;

            hideEditModal();
            showListModal();
            renderStatus(searchInput.value.trim());
        } catch (err) {
            console.error(err);
            editErrorEl.textContent = 'Network error.';
        }
    }

    // ---------- EVENTS ----------
    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeAll);
    backdrop?.addEventListener('click', closeAll);

    searchInput?.addEventListener('input', () => {
        renderStatus(searchInput.value.trim());
    });

    toggleAddBtn?.addEventListener('click', () => {
        addErrorEl.textContent = '';
        addPanel.classList.toggle('hidden');
        if (!addPanel.classList.contains('hidden')) {
            newNameInput.focus();
        }
    });

    saveBtn?.addEventListener('click', saveNewStatus);
    newNameInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveNewStatus();
        }
    });

    // edit modal events
    editCloseBtn?.addEventListener('click', () => {
        // από edit γυρνάμε στη λίστα
        editErrorEl.textContent = '';
        hideEditModal();
        showListModal();
    });

    editSaveBtn?.addEventListener('click', saveEditedStatus);
    editDeleteBtn?.addEventListener('click', deleteCurrentStatus);

    editNameInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditedStatus();
        }
    });
});
