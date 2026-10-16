class Calendar {

    static monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    static weekNames = [
        "Mon", "Tue", "Wed",
        "Thu", "Fri", "Sat", "Sun"
    ];

    databaseHandler = null;
    elementEditor = null;

    selectedDay = null;
    selectedDate = null;
    scheduleSection = null;
    weekContainer = null;
    previousMonthButton = null;
    nextMonthButton = null;

    constructor() {

        this.databaseHandler = new DatabaseHandler();
        this.elementEditor = new ElementEditor(this.databaseHandler);

        this.selectedDate = new Date();
        this.scheduleSection = document.getElementById("schedule-section");
        this.previousMonthButton = document.getElementById("previous-month-button");
        this.nextMonthButton = document.getElementById("next-month-button");

        this.weekContainer = document.createElement("div");
        this.scheduleSection.append(this.weekContainer);

        this.previousMonthButton.addEventListener("click", () => {
            this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
            this.#displayMonth();
        });
        this.nextMonthButton.addEventListener("click", () => {
            this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
            this.#displayMonth();
        });

        this.#displayMonth();
    }

    #displayMonth() {
        const month = this.selectedDate.getMonth() + 1;
        const year = this.selectedDate.getFullYear();

        this.#displayCalendarName(month - 1);
        this.weekContainer.replaceChildren();

        const startDate = new Date(year, month - 1, 1);
        const numberOfDaysInMonth = new Date(year, month, 0).getDate();

        // Tells me how many empty days we need in order to always start each week on a monday
        const startDay = (startDate.getDay() + 6) % 7;

        let currentWeekDiv = document.createElement("div");
        currentWeekDiv.classList.add("day-container");

        const totalDays = startDay + numberOfDaysInMonth;

        for (let i = 0; i < totalDays; i++) {
            let tempDay = null;

            const dayName = Calendar.weekNames[i % 7];

            // check if day belongs to previous month.
            if (i < startDay) {
                const previousMonth = new Date(year, month - 1, -1); // last day of previous month
                const offset = previousMonth.getDate() - (startDay - i) + 2;
                const monthNumber = (month === 1 ? 12 : month - 1)

                tempDay = this.#createDayNode(dayName, offset, monthNumber, true);
            } else {
                const dayNumber = i - startDay + 1;

                tempDay = this.#createDayNode(dayName, dayNumber, month, false);
            }

            currentWeekDiv.append(tempDay);

            // start a new week container after 7 days have been added
            if (currentWeekDiv.children.length === 7) {
                this.weekContainer.append(currentWeekDiv);
                currentWeekDiv = document.createElement("div");
                currentWeekDiv.classList.add("day-container");
            }
        }

        // fill out the remaining days
        if (currentWeekDiv.children.length > 0) {
            const missingDays = 7 - currentWeekDiv.children.length;

            for (let i = 0; i < missingDays; i++) {

                const dayName = Calendar.weekNames[7 - missingDays + i];
                const monthNumber = (month === 12 ? 1 : month + 1);
                const tempDay = this.#createDayNode(dayName, i + 1, monthNumber, true);
                currentWeekDiv.append(tempDay);
            }
            this.weekContainer.append(currentWeekDiv);
        }
        this.#loadTasks();
    }

    #displayCalendarName(month) {
        const calendarHeader = document.getElementById("month-name");
        calendarHeader.textContent = Calendar.monthNames[month] + " " + this.selectedDate.getFullYear();;
    }

    #createDayNode(dayName, dayNumber, month, isEmpty) {
        const daySection = document.createElement("section");
        daySection.setAttribute("id", `${this.selectedDate.getFullYear()}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`);


        const dayHeader = document.createElement("p");
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("day-name");
        nameSpan.textContent = `${dayName} `;

        const dateSpan = document.createElement("span");
        dateSpan.textContent = `${dayNumber}/${month}`;

        dayHeader.append(nameSpan, dateSpan);
        daySection.append(dayHeader);

        if (!isEmpty) {
            daySection.classList.add("day-section");
            dayHeader.classList.add("day-header");

            daySection.addEventListener("click", () => {
                this.#changeFocusedDay(daySection);
            });
        }
        else {
            dayHeader.classList.add("day-header", "empty");
            daySection.classList.add("day-section", "empty");

            daySection.addEventListener("click", () => {
                const step = dayNumber > 15 ? -1 : 1;

                this.selectedDate.setMonth(this.selectedDate.getMonth() + step);
                this.#displayMonth();
            });
        }

        return daySection;
    }

    async #loadTasks() {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth() + 1;

        const tasks = await this.databaseHandler.getCalendarTasks(year, month);

        for (const task of tasks) {

            const daySection = document.getElementById(task.task_date);
            if (daySection) {
                const tempTask = this.#createTaskElement(task.title, task.id, task.is_owner, task.name);

                daySection.append(tempTask);
            }
        }
    }

    async #saveTask(title, parentElement) {
        const taskDate = this.selectedDay.id;
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth() + 1;

        const savedTask = await this.databaseHandler.saveCalendarTask(year, month, taskDate, title);

        if (!savedTask) {
            console.error("Failed to save task");
            await showErrorDialog("Failed to save task. Please try again later.");
            return;
        }
        const finishedTask = this.#createTaskElement(savedTask.title, savedTask.id, true);
        this.selectedDay.insertBefore(finishedTask, parentElement);

    }

    #changeFocusedDay(dayElement) {
        if (this.selectedDay === dayElement) { return; }

        this.#clearFocusedDay();

        this.selectedDay = dayElement;

        this.selectedDay.classList.add("selected-day");

        this.selectedDay.append(this.#createAddButton());
    }

    #clearFocusedDay() {
        if (this.selectedDay === null) {
            return;
        }
        this.selectedDay.classList.remove("selected-day");
        this.selectedDay.querySelector(".add-item-button")?.remove();
        this.selectedDay.querySelector(".task-input-field")?.remove();
    }

    #createAddButton() {
        const addButton = document.createElement("button");
        addButton.className = "add-item-button";
        addButton.textContent = "+";

        addButton.addEventListener("click", (e) => {
            e.stopPropagation();

            addButton.classList.toggle("hidden");

            const inputField = this.#createInputField(addButton);
            if (inputField !== null) {
                this.selectedDay.insertBefore(inputField, addButton);
                inputField.focus();
            }
        })

        return addButton;
    }

    #createInputField(button) {
        if (this.selectedDay.querySelector(".task-input-field") == null) {
            const inputField = document.createElement("input");
            inputField.className = "task-input-field";
            inputField.type = "text";
            inputField.placeholder = "Enter Task";

            const removeFieldRevealButton = () => {
                inputField.remove();
                button.classList.remove("hidden");
            }

            inputField.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    const title = inputField.value.trim();
                    if (title) {
                        await this.#saveTask(title, inputField);
                    }

                    removeFieldRevealButton();
                }
                else if (e.key === "Escape") {
                    removeFieldRevealButton();
                }
            });

            return inputField;
        }
        return null;
    }

    #createTaskElement(inputText, id = null, is_owner, ownerName = null) {
        const finishedTask = document.createElement("li");
        finishedTask.classList.add("day-task");
        finishedTask.textContent = inputText;
        if (id) finishedTask.dataset.id = id;


        if (!is_owner) {
            finishedTask.classList.add("immutable");
            finishedTask.textContent += ` (${ownerName})`;
        } else {
            finishedTask.classList.add("interractable");
            finishedTask.addEventListener("click", async (e) => {
                e.stopPropagation();

                const editWindow = document.getElementById("edit-task-window");
                const optionWindow = this.elementEditor.createOptionWindow(finishedTask, "task");

                editWindow.append(optionWindow);

            });
        }

        return finishedTask;
    }
}

new Calendar();