const listSection = document.getElementById("list-section");
const emptyList = document.getElementById("empty-list");
emptyList.classList.add("empty");
const createNewListButton = document.getElementById("create-new-list-button");

const elementEditor = new ElementEditor();

if (createNewListButton) {
    const parent = createNewListButton.parentElement;

    createNewListButton.addEventListener("mouseenter", () => {
        parent.classList.add("highlight");
    });

    createNewListButton.addEventListener("mouseleave", () => {
        parent.classList.remove("highlight");
    });

    createNewListButton.addEventListener("click", () => {
        createNewList(emptyList);
    })
}
else {
    console.log("NO BUTTON FOUND");
}

function createListBox(list, isOwner) {
    const listBox = document.createElement("div");
    listBox.classList.add("list-box");
    listBox.id = `list-${list.id}`;

    const titleDiv = document.createElement("div");
    titleDiv.classList.add("list-title-container");

    const titleElement = document.createElement("h4");
    titleElement.classList.add("list-title");
    titleElement.textContent = list.title;
    titleElement.dataset.id = list.id;

    if (isOwner) {

        setUpOwnerList(listBox, titleElement, titleDiv);

    } else {
        titleDiv.classList.add("not-owned");
        listBox.classList.add("not-owned");

        const ownerName = document.createElement("p");
        ownerName.textContent = `(${list.owner_name})`;
        ownerName.classList.add("list-owner");

        titleDiv.append(ownerName);
    }

    titleDiv.appendChild(titleElement);

    listBox.appendChild(titleDiv);
    return listBox;
}

function setUpOwnerList(listBox, titleElement, titleDiv) {

    titleElement.classList.add("interrractable");
    titleElement.addEventListener("click", (e) => {
        e.stopPropagation();

        const editTaskWindow = document.getElementById("edit-list-window");
        const optionWindow = elementEditor.createOptionWindow(titleElement, "list-title");

        editTaskWindow.append(optionWindow);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", async () => {
        const confirmed = confirm(`Are you sure you want to delete the list "${list.title}"?`);
        if (confirmed) {
            const success = await deleteListFromBackend(list.id);
            if (success) {
                listBox.remove();
            } else {
                alert("Failed to delete the list. Please try again.");
            }
        }
    });

    titleDiv.appendChild(deleteButton);
}

async function loadLists() {
    const lists = await getListsFromBackend();
    const container = emptyList.parentElement;

    console.log(lists);

    for (list of lists) {
        const isOwner = list.is_owner;

        const listBox = createListBox(list, isOwner);
        container.insertBefore(listBox, emptyList);

        // read in all list elements in a div container and append it to the listBox
        const elementContainer = await loadListElements(list.id, isOwner);
        listBox.append(elementContainer);

        if (isOwner) {
            const addElementButton = createAddElementButton(list.id, elementContainer);
            elementContainer.append(addElementButton);
        }
    };
}

async function loadListElements(listId, isOwner) {
    const container = document.createElement("div");
    container.classList.add("list-element-container");

    const listElements = await getListElementsFromBackend(listId);

    console.log(listElements);

    for (const listElement of listElements) {
        const newListElement = createListElement(listElement, isOwner);
        container.append(newListElement);
    }
    return container;
}

function createAddElementButton(listId, elementContainer) {
    const addElementButton = document.createElement("button");
    addElementButton.textContent = "+";
    addElementButton.classList.add("add-element-button");

    addElementButton.addEventListener("click", () => {
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Enter text";
        inputField.style.textAlign = "center";

        inputField.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                const title = inputField.value.trim();
                const newListElement = await saveListElementToBackend(listId, title);
                if(newListElement) {
                    addElementButton.parentElement.insertBefore(createListElement(newListElement, true), addElementButton);
                }else{
                    console.error("Failed to save the new list element. Please try again.");
                }
                addElementButton.style.display = "block";
                inputField.remove();
            }
        });

        addElementButton.style.display = "none";
        elementContainer.appendChild(inputField);
        inputField.focus();
    });

    return addElementButton;
}

function createListElement(listElement, isOwner) {
    const taskElementContainer = document.createElement("div");
        taskElementContainer.style.display = "flex";

        const tempElement = document.createElement("p");
        tempElement.classList.add("list-element");
        tempElement.textContent = listElement.title;
        tempElement.dataset.id = listElement.id;

        if (isOwner) {
            const checkBox = document.createElement("input");
            checkBox.classList.add("checkbox");
            checkBox.type = "checkbox";
            checkBox.checked = listElement.is_checked;
            checkBox.addEventListener("click", async () => {
                const update = await checkListElement(tempElement.dataset.id, checkBox.checked);
                if (checkBox.checked) {
                    tempElement.classList.add("checked");
                } else {
                    tempElement.classList.remove("checked");
                }
            });

            taskElementContainer.append(checkBox);

            tempElement.classList.add("interractable");
            tempElement.addEventListener("click", (e) => {
                e.stopPropagation();

                const editTaskWindow = document.getElementById("edit-list-window");
                const optionWindow = elementEditor.createOptionWindow(tempElement, "list-element");

                editTaskWindow.append(optionWindow);
            });
        }
        if (listElement.is_checked) {
            tempElement.classList.add("checked");
        }

        taskElementContainer.append(tempElement);

        return taskElementContainer;
}

function createNewList(callerElement) {
    const parent = callerElement.parentElement;
    const existing = parent.querySelector(".new-list");

    if (existing) {
        console.error("New list already exists. Not creating another one.");
        existing.querySelector("input").focus();
        return;
    }

    const newList = document.createElement("div");
    newList.classList.add("list-box");
    newList.classList.add("new-list");

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Enter list title";
    titleInput.style.marginTop = "20px";
    titleInput.style.textAlign = "center";

    console.log("Created new list input field", titleInput);

    titleInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const title = titleInput.value.trim();
            if (title) {
                // Spara till backend här
                const savedList = await saveListToBackend(title);
                if (savedList) {
                    newList.replaceWith(createListBox(savedList, true));
                } else {
                    console.error("Failed to save the new list. Please try again.");
                }
            }
        } else if (e.key === "Escape") {
            newList.remove();
        }
    });


    newList.append(titleInput);
    console.log("newList efter append:", newList);
    parent.insertBefore(newList, callerElement);
    titleInput.focus();

}

async function getListsFromBackend() {
    try {
        const response = await fetch('/api/lists', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (response.ok) {
            console.log("Fetched lists from backend:", data);
            return data; // Return the fetched lists
        } else {
            console.error("Failed to fetch lists from backend:", data);
            return []; // Return an empty array on failure
        }
    } catch (error) {
        console.error("Error fetching lists from backend:", error);
        return []; // Return an empty array on error
    }
}

async function getListElementsFromBackend(listId) {
    try {
        const response = await fetch(`/api/lists/${listId}/elements`, {
            method: "GET",
            header: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.elements;
        }
    } catch (e) {
        console.error("Failed to get ListElements from backend", e);
    }
}

async function checkListElement(elementId, isChecked) {
    try {
        const response = await fetch(`/api/lists/elements/${elementId}/${isChecked}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (e) {
        console.error("Failed to update List Element", e);
    }
}

async function saveListToBackend(title) {
    try {
        const response = await fetch('/api/lists', {
            method: 'POST',
            body: JSON.stringify({ title }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (response.ok) {
            console.log("Saved new list to backend:", data);
            return data; // Return the saved list
        } else {
            console.error("Error saving new list to backend:", data);
            return null; // Return null on failure
        }
    } catch (error) {
        console.error("Error saving new list to backend:", error);
        return null; // Return null on error
    }
}

async function saveListElementToBackend(listId, title) {
    try {
        const response = await fetch(`/api/lists/${listId}/elements`, {
            method: 'POST',
            body: JSON.stringify({ title }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (response.ok) {
            console.log("Saved new list element to backend:", data);
            return data;
        }
    } catch (e) {
        console.error("Error saving new list element to backend:", e);
    }
}


async function deleteListFromBackend(listId) {
    try {
        const response = await fetch(`/api/lists/${listId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            console.log(`List with ID ${listId} deleted successfully.`);
            return true;
        } else {
            console.error(`Failed to delete list with ID ${listId}.`);
            return false;
        }
    } catch (error) {
        console.error(`Error deleting list with ID ${listId}:`, error);
        return false;
    }
}

loadLists();