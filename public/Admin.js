const errorMessageElement = document.getElementById('error-message');

function showError(message) {
    errorMessageElement.textContent = message;
}

function clearError() {
    errorMessageElement.textContent = '';
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function createUserRow(user) {
    const row = document.createElement('tr');

    row.append(
        createCell(user.uID),
        createCell(user.fName),
        createCell(user.lName),
        createCell(user.email),
        createCell(user.is_admin ? 'Yes' : 'No')
    );

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => deleteUser(user));

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Admin';
    toggleButton.classList.add('edit-btn');
    toggleButton.addEventListener('click', () => toggleAdmin(user));

    const actionCell = document.createElement('td');
    actionCell.append(deleteButton, toggleButton);
    row.append(actionCell);

    return row;
}

async function loadUsers() {
    try {
        const response = await fetch('/admin/users');

        if (!response.ok) {
            showError('Error loading users. Please try again later.');
            return;
        }

        const users = await response.json();
        const tbody = document.getElementById('userTableBody');
        tbody.replaceChildren();

        for (const user of users) {
            tbody.append(createUserRow(user));
        }

        clearError();
    } catch (e) {
        console.error(e);
        showError('Network error. Please try again later.');
    }
}

async function deleteUser(user) {
    const confirmed = await showConfirmationDialog(
        `Are you sure you want to delete ${user.fName} ${user.lName} (${user.email})?`
    );
    if (!confirmed) return;

    try {
        const response = await fetch(`/admin/users/${user.uID}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            showError(data.error || 'Error deleting user. Please try again later.');
            return;
        }

        await loadUsers();
    } catch (e) {
        console.error(e);
        showError('Network error. Please try again later.');
    }
}

async function toggleAdmin(user) {
    const newAdminStatus = !user.is_admin;
    const action = newAdminStatus ? 'make' : 'remove';
    const confirmed = await showConfirmationDialog(
        newAdminStatus
            ? `Make ${user.fName} ${user.lName} an admin?`
            : `Remove admin rights from ${user.fName} ${user.lName}?`
    );
    if (!confirmed) return;

    try {
        const response = await fetch(`/admin/users/${user.uID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_admin: newAdminStatus })
        });

        if (!response.ok) {
            const data = await response.json();
            showError(data.error || `Failed to ${action} admin. Please try again later.`);
            return;
        }

        await loadUsers();
    } catch (e) {
        console.error(e);
        showError('Network error. Please try again later.');
    }
}

function logout() {
    fetch('/logout', { method: 'POST' }).then(() => {
        window.location.href = '/login.html';
    });
}

window.addEventListener('load', loadUsers);