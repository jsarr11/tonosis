const form = document.getElementById('login-form');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            errorEl.textContent = data.message || 'Invalid credentials';
            return;
        }

        // session είναι στο server, απλά κάνουμε redirect
        window.location.href = '/home';
    } catch (err) {
        errorEl.textContent = 'Network error: ' + err.message;
    }
});