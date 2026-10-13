async function checkLoggedIn() {
    try {
        const response = await fetch("/api/logged-in", {
            method: "GET"
        });
        if (response.status === 401) {
            window.location.href = "/login.html"
        }
    } catch (e) {
        console.error("Not logged in", e);
    }
}

function logout() {
    fetch('/logout', {
        method: 'POST'
    }).then(() => {
        window.location.href = '/login.html';
    })
}

checkLoggedIn();