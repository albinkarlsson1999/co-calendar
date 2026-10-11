document.addEventListener("DOMContentLoaded", () => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const userName = capitalize(localStorage.getItem("firstName") || "User");
    document.getElementById("greeting").textContent = `Hello, ${userName}!`;
});


class UserNavigationHandler {

    myAccountButton = null;

    constructor() {

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

    #submit(shareWindow) {
        const email = document.getElementById("share-email").value.trim();
        const sendTasks = document.getElementById("share-tasks-checkbox").checked;
        const sendLists = document.getElementById("share-lists-checkbox").checked;

        if (email) {
            this.shareElements(email, sendTasks, sendLists);

            shareWindow.style.display = "none";
            document.getElementById("share-email").value = "";
        }
    }

    async shareElements(email, willShareTasks, willShareLists) {

        if (willShareTasks) {
            try {
                const response = await fetch("/api/tasks/share", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    const data = await response.json()
                    console.log(data.message);
                }
            } catch (e) {
                console.error("Failed to share:", e);
            }
        }

        if (willShareLists) {
            try {
                const response = await fetch("/api/lists/share", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    const data = await response.json()
                    console.log(data.message);
                }
            } catch (e) {
                console.error("Failed to share:", e);
            }
        }
    }

    logout() {
        fetch('/logout', {
            method: 'POST'
        }).then(() => {
            window.location.href = '/login.html';
        })
    }
}

const userNavigationHandler = new UserNavigationHandler();