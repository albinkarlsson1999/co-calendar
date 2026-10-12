class DatabaseHandler {

    async getCalendarTasks(year, month) {
        try {
            const result = await fetch(`/api/tasks/${year}/${month}`, {
                method: "GET",
            });

            if (!result.ok) return;

            const tasks = await result.json();
            return tasks;

        } catch (e) {
            console.log("Error loading", e);
        }
    }

    async getLists() {
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

    async getListElements(listId) {
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

    async saveCalendarTask(year, month, taskDate, title) {
        try {
            const response = await fetch(`/api/tasks/${year}/${month}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task_date: taskDate, title: title })
            });

            if (response.ok) {
                const savedTask = await response.json();
                return savedTask;
            }
        } catch (e) {
            console.log("Failed to save task: ", e);
        }
    }

    async saveList(title) {
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

    async saveListElement(listId, title) {
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

    async deleteFromDatabase(type, id) {
        try {
            const response = await fetch(`/api/${type}/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log(`${type} with ID ${id} deleted successfully.`);
                return true;
            } else {
                console.error(`Failed to delete ${type} with ID ${id}.`);
                return false;
            }
        } catch (error) {
            console.error(`Error deleting ${type} with ID ${id}:`, error);
            return false;
        }
    }

    async editInDatabase(editedText, path, id) {
        try {
            const response = await fetch(`/api/${path}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: editedText })
            });

            if (response.ok) {
                return true;
            }
        } catch (e) {
            console.error("Failed to edit", e);
        }
    }

    async editCheckboxOfListElement(elementId, isChecked) {
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
}