class ElementEditor {

    databaseHandler = null;

    constructor(databaseHandler) {
        this.databaseHandler = databaseHandler;
    }

    createOptionWindow(element, type) {
        const optionWindow = document.createElement("div");
        optionWindow.classList.add("task-option-window");

        function handleKeydown(e) {
            if (e.key === "Escape") {
                close();
            }
        }

        function close() {
            optionWindow.remove();
            document.removeEventListener("keydown", handleKeydown);
        }

        const container = document.createElement("div");
        container.classList.add("task-option-content");

        const elementLocation = element.getBoundingClientRect();

        container.style.left = `${elementLocation.left}px`;
        container.style.top = `${elementLocation.bottom + 5}px`;

        const editButton = document.createElement("button");
        const exitButton = document.createElement("button");


        editButton.textContent = "Edit";
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();

            const editField = this.#handleEdit(element, close, type);
            container.insertBefore(editField, editButton);

            editButton.style.display = "none";
            editField.focus();
        })
        container.append(editButton);

        //Only add the delete button to Tasks and List-Elements
        if (type == "task" || type == "list-element") {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", async () => {
                switch (type) {
                    case "task": {
                        await this.#deleteElement(element, "tasks");
                        break;
                    }
                    case "list-element": {
                        await this.#deleteElement(element, "lists/elements", element.parentElement);
                        break;
                    }
                }
                close();
            });
            container.append(deleteButton);
        }

        exitButton.textContent = "Exit";
        exitButton.addEventListener("click", () => {
            close();
        });
        container.append(exitButton);

        optionWindow.append(container);

        document.addEventListener("keydown", handleKeydown);

        optionWindow.addEventListener("click", (e) => {
            if (e.target === optionWindow) {
                close();
            }
        });

        return optionWindow;
    }

    async #deleteElement(element, path, parentElement = null) {
        const elementId = element.dataset.id;

        const success = Boolean(await this.databaseHandler.deleteFromDatabase(path, elementId));

        if (!success) {
            console.error("Failed to delete element from database.");
            await showErrorDialog("Failed to delete element. Please try again later.");
            return;
        }

        element.remove();
        if (parentElement) {
            parentElement.remove();
        }
    }

    async #edit(element, editedText, path) {
        const elementId = element.dataset.id;
        console.log(elementId);

        if (await this.databaseHandler.editInDatabase(editedText, path, elementId)) {
            element.textContent = editedText;
            return true;
        }

        return false;
    }

    #createEditField(elementText) {
        const editField = document.createElement("input");
        editField.classList.add("input-field");
        editField.value = elementText;

        return editField;
    }

    #handleEdit(element, close, type) {
        const editField = this.#createEditField(element.textContent);

        editField.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {

                const editedText = editField.value.trim();
                if (!editedText) {
                    console.error("Content cannot be empty.");
                    return;
                }

                switch (type) {
                    case "task": {
                        if (await this.#edit(element, editedText, "tasks")) {
                            close();
                        }
                        break;
                    }
                    case "list-title": {
                        if (await this.#edit(element, editedText, "lists")) {
                            close();
                        }
                        break;
                    }
                    case "list-element": {
                        if (await this.#edit(element, editedText, "lists/elements")) {
                            close();
                        }
                        break;
                    }
                }

            }
        });

        return editField;
    }



}