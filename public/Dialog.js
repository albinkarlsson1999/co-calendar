// USE: await showConfirmationDialog("Are you sure you want to delete this item?");
function showConfirmationDialog(message) {
    const confirmationDialog = document.getElementById('confirmation-dialog');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('confirmation-dialog-cancel');

    confirmationMessage.textContent = message;
    confirmationDialog.style.display = 'flex';
    cancelButton.focus();

    return new Promise((resolve) => {
        function handleKeydown(event) {
            if (event.key === 'Escape') {
                close(false);
            }
        }

        function close(result) {
            confirmationDialog.style.display = 'none';
            document.removeEventListener('keydown', handleKeydown);
            resolve(result);
        }

        document.addEventListener('keydown', handleKeydown);
        confirmButton.onclick = () => close(true);
        cancelButton.onclick = () => close(false);
    });
}


// USE: await showErrorDialog("An error occurred while processing your request.");
function showErrorDialog(message) {
    const errorDialog = document.getElementById('error-dialog');
    const errorMessage = document.getElementById('error-dialog-message');
    const closeButton = document.getElementById('error-dialog-close');

    errorMessage.textContent = message;
    errorDialog.style.display = 'flex';


    return new Promise((resolve) => {
        function handleKeydown(event) {
            if (event.key === 'Escape') {
                close();
            }
        }

        function close() {
            errorDialog.style.display = 'none';
            document.removeEventListener('keydown', handleKeydown);
            resolve();
        }

        document.addEventListener('keydown', handleKeydown);
        closeButton.onclick = () => {
            close();
        };
    });
}