document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.log(e);
    }
    window.location.href = '/';
});
