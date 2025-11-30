// public/js/clients.js

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-clients-btn');
    const closeBtn = document.getElementById('close-clients-btn');
    const backdrop = document.getElementById('clients-backdrop');
    const modal = document.getElementById('clients-modal');

    // edit modal
    const editModal = document.getElementById('client-edit-modal');
    const editCloseBtn = document.getElementById('edit-close-btn');
    const editNameInput = document.getElementById('edit-client-name');
    const editActiveCheckbox = document.getElementById('edit-client-active');
    const editErrorEl = document.getElementById('edit-client-error');
    const editSaveBtn = document.getElementById('edit-save-btn');
    const editDeleteBtn = document.getElementById('edit-delete-btn');

    const searchInput = document.getElementById('clients-search');
    const listEl = document.getElementById('clients-list');
    const emptyEl = document.getElementById('clients-empty');

    const toggleAddBtn = document.getElementById('toggle-add-client-btn');
    const addPanel = document.getElementById('add-client-panel');
    const newNameInput = document.getElementById('new-client-name');
    const saveBtn = document.getElementById('save-client-btn');
    const addErrorEl = document.getElementById('add-client-error');

    let allClients = [];
    let isLoadedOnce = false;
    let currentClient = null; // για το edit modal

    // ---------- MAIN MODAL ----------
    function openModal() {
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        editModal.classList.add('hidden');

        if (!isLoadedOnce) {
            loadClients();
            isLoadedOnce = true;
        } else {
            renderClients(searchInput.value.trim());
        }
    }

    function closeAllModals() {
        backdrop.classList.add('hidden');
        modal.classList.add('hidden');
        editModal.classList.add('hidden');
        currentClient = null;
    }

    // ---------- LOAD CLIENTS ----------
    async function loadClients() {
        try {
            const res = await fetch('/api/clients');
            const data = await res.json();

            if (!res.ok || !data.success) {
                console.error('Error loading clients:', data);
                allClients = [];
            } else {
                allClients = Array.isArray(data.data) ? data.data : [];
            }
            renderClients(searchInput.value.trim());
        } catch (err) {
            console.error('Network error loading clients:', err);
            allClients = [];
            renderClients(searchInput.value.trim());
        }
    }

    // ---------- RENDER LIST ----------
    function renderClients(filterText) {
        const query = (filterText || '').toLowerCase();
        listEl.innerHTML = '';

        const filtered = allClients.filter(c =>
            !query || (c.name && c.name.toLowerCase().includes(query))
        );

        if (filtered.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        } else {
            emptyEl.classList.add('hidden');
        }

        filtered.forEach(client => {
            const li = document.createElement('li');

            const dot = document.createElement('span');
            dot.classList.add('status-dot');
            if (client.is_active === 1 || client.is_active === '1') {
                dot.classList.add('active');
            } else {
                dot.classList.add('inactive');
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = client.name || '(no name)';
            nameSpan.classList.add('client-name');

            li.appendChild(dot);
            li.appendChild(nameSpan);

            li.addEventListener('click', () => {
                openEditModal(client);
            });

            listEl.appendChild(li);
        });
    }

    // ---------- ADD NEW CLIENT ----------
    async function saveNewClient() {
        const name = newNameInput.value.trim();
        addErrorEl.textContent = '';

        if (!name) {
            addErrorEl.textContent = 'Name is required.';
            return;
        }

        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    is_active: 1,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                addErrorEl.textContent = data.message || 'Error saving client.';
                return;
            }

            allClients.push(data.data);

            newNameInput.value = '';
            addErrorEl.textContent = '';

            renderClients(searchInput.value.trim());
        } catch (err) {
            console.error('Network error saving client:', err);
            addErrorEl.textContent = 'Network error.';
        }
    }

    // ---------- EDIT MODAL ----------
    function openEditModal(client) {
        currentClient = client;
        editErrorEl.textContent = '';

        editNameInput.value = client.name || '';
        editActiveCheckbox.checked =
            client.is_active === 1 || client.is_active === '1';

        // δείχνουμε μόνο το edit modal, οχι το list modal
        modal.classList.add('hidden');
        editModal.classList.remove('hidden');
        backdrop.classList.remove('hidden');

        editNameInput.focus();
    }

    async function saveEditedClient() {
        if (!currentClient) return;

        const newName = editNameInput.value.trim();
        const active = editActiveCheckbox.checked ? 1 : 0;

        if (!newName) {
            editErrorEl.textContent = 'Name is required.';
            return;
        }

        try {
            const res = await fetch(`/api/clients/${currentClient.client_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    is_active: active,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                editErrorEl.textContent = data.message || 'Error updating client.';
                return;
            }

            // ενημέρωση τοπικού πίνακα
            const idx = allClients.findIndex(c => c.client_id === currentClient.client_id);
            if (idx !== -1) {
                allClients[idx] = data.data;
            }

            // πίσω στο main modal
            editErrorEl.textContent = '';
            editModal.classList.add('hidden');
            modal.classList.remove('hidden');
            renderClients(searchInput.value.trim());
        } catch (err) {
            console.error('Network error updating client:', err);
            editErrorEl.textContent = 'Network error.';
        }
    }

    async function deleteCurrentClient() {
        if (!currentClient) return;

        const sure = window.confirm('Να διαγραφεί ο πελάτης;');
        if (!sure) return;

        try {
            const res = await fetch(`/api/clients/${currentClient.client_id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                editErrorEl.textContent = data.message || 'Error deleting client.';
                return;
            }

            // βγάλε τον από allClients
            allClients = allClients.filter(c => c.client_id !== currentClient.client_id);

            currentClient = null;
            editErrorEl.textContent = '';

            // κλείνουμε edit, γυρίζουμε στο list
            editModal.classList.add('hidden');
            modal.classList.remove('hidden');
            renderClients(searchInput.value.trim());
        } catch (err) {
            console.error('Network error deleting client:', err);
            editErrorEl.textContent = 'Network error.';
        }
    }

    // ---------- EVENTS ----------
    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeAllModals);
    if (backdrop) backdrop.addEventListener('click', closeAllModals);

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderClients(searchInput.value.trim());
        });
    }

    if (toggleAddBtn) {
        toggleAddBtn.addEventListener('click', () => {
            addErrorEl.textContent = '';
            if (addPanel.classList.contains('hidden')) {
                addPanel.classList.remove('hidden');
                newNameInput.focus();
            } else {
                addPanel.classList.add('hidden');
            }
        });
    }

    if (saveBtn) saveBtn.addEventListener('click', saveNewClient);

    if (newNameInput) {
        newNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveNewClient();
            }
        });
    }

    // edit modal buttons
    if (editCloseBtn) editCloseBtn.addEventListener('click', closeAllModals);
    if (editSaveBtn) editSaveBtn.addEventListener('click', saveEditedClient);
    if (editDeleteBtn) editDeleteBtn.addEventListener('click', deleteCurrentClient);

    if (editNameInput) {
        editNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedClient();
            }
        });
    }
});
