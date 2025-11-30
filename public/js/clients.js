// public/js/clients.js

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-clients-btn');
    const closeBtn = document.getElementById('close-clients-btn');
    const backdrop = document.getElementById('clients-backdrop');
    const modal = document.getElementById('clients-modal');

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

    function openModal() {
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        if (!isLoadedOnce) {
            loadClients();
            isLoadedOnce = true;
        } else {
            renderClients(searchInput.value.trim());
        }
    }

    function closeModal() {
        backdrop.classList.add('hidden');
        modal.classList.add('hidden');
    }

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

            li.appendChild(dot);
            li.appendChild(nameSpan);

            listEl.appendChild(li);
        });
    }

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

            // add to local list
            allClients.push(data.data);

            // clear
            newNameInput.value = '';
            addErrorEl.textContent = '';

            // re-render
            renderClients(searchInput.value.trim());
        } catch (err) {
            console.error('Network error saving client:', err);
            addErrorEl.textContent = 'Network error.';
        }
    }

    // Event listeners
    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }

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

    if (saveBtn) {
        saveBtn.addEventListener('click', saveNewClient);
    }

    if (newNameInput) {
        newNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveNewClient();
            }
        });
    }
});
