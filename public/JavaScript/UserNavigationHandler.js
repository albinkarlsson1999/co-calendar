document.addEventListener("DOMContentLoaded", () => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const userName = capitalize(localStorage.getItem("firstName") || "User");
    document.getElementById("greeting").textContent = `Hello, ${userName}!`;
});

class UserNavigationHandler {

    databaseHandler = null;

    myAccountButton = null;

    constructor() {

        this.databaseHandler = new DatabaseHandler();

        this.myAccountButton = document.getElementById("account-button");
        this.myAccountButton.addEventListener("click", () => {
            window.location.href = "my-account.html";
        });

        this.setUpShare();
    }

    setUpShare() {
        const shareWindow = document.getElementById("share-window");
        const shareButton = document.getElementById("share-button");
        const inputField = document.getElementById("share-email");
        const submitButton = document.getElementById("submit-share");

        shareButton.addEventListener("click", () => {
            shareWindow.style.display = "flex";
        });

        window.addEventListener("click", (event) => {
            if (event.target === shareWindow) {
                shareWindow.style.display = "none";
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                shareWindow.style.display = "none";
            }
        });

        inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.#submit(shareWindow);
            }
        });

        submitButton.addEventListener("click", () => {
            this.#submit(shareWindow);
        });

    }

    async #submit(shareWindow) {
        const email = document.getElementById("share-email").value.trim();
        const sendTasks = document.getElementById("share-tasks-checkbox").checked;
        const sendLists = document.getElementById("share-lists-checkbox").checked;

        if (email) {
            this.#showMessage(await this.#sendShareRequest(email, sendTasks, sendLists));
            shareWindow.style.display = "none";
        }
        document.getElementById("share-email").value = "";
    }

    #showMessage(messages) {
        if (!messages) {
            return;
        }

        const confirmationWindow = document.getElementById("confirmation-window");

        const confirmationContent = document.getElementById("confirmation-content");
        confirmationContent.innerHTML = "";

        for (const message of messages) {
            const messageElement = document.createElement("p");
            messageElement.textContent = message;
            messageElement.style.textAlign = "center";
            messageElement.style.margin = "1px";
            confirmationContent.append(messageElement);
        }

        const button = document.createElement("button");
        button.textContent = "OK";
        confirmationContent.append(button);

        button.addEventListener("click", () => {
            confirmationWindow.style.display = "none";
            confirmationContent.innerHTML = "";
        });

        window.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
                confirmationWindow.style.display = "none";
                confirmationContent.innerHTML = "";
            }
        });

        confirmationWindow.style.display = "flex";
    }

    async #sendShareRequest(email, willShareTasks, willShareLists) {
        const results = [];

        if (willShareTasks) {
            results.push(await this.databaseHandler.sendShareRequest("tasks", email))
        }

        if (willShareLists) {
            results.push(await this.databaseHandler.sendShareRequest("lists", email));
        }

        return results;
    }
}

const userNavigationHandler = new UserNavigationHandler();