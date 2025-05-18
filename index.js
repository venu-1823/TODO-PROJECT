let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");

const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');

function getTodoItem() {
    let stringifedTodoList = localStorage.getItem("todoList");
    let parseTodoList = JSON.parse(stringifedTodoList);
    if (parseTodoList === null) {
        return [];
    } else {
        return parseTodoList;
    }
}
let todoList = getTodoItem();

let todosCount = todoList.length;

function saveTodosToLocalStorage() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
}

function onTodoStatusChange(checkboxId, labelId, todoId) {
    let checkboxElement = document.getElementById(checkboxId);
    let labelElement = document.getElementById(labelId);
    labelElement.classList.toggle('checked');

    let todoObjectIndex = todoList.findIndex(function(eachTodo) {
        let eachTodoId = "todo" + eachTodo.uniqueNo;
        if (eachTodoId === todoId) {
            return true;
        } else {
            return false;
        }
    });

    let todoObject = todoList[todoObjectIndex];
    if (todoObject.isChecked === true) {
        todoObject.isChecked = false;
    } else {
        todoObject.isChecked = true;
    }
    saveTodosToLocalStorage();
}

function onDeleteTodo(todoId) {
    let todoElement = document.getElementById(todoId);
    if (todoElement) todoElement.remove();
    let deleteIndex = todoList.findIndex(function(eachTodo) {
        let eachTodoId = "todo" + eachTodo.uniqueNo;
        if (eachTodoId === todoId) {
            return true;
        } else {
            return false;
        }
    });
    todoList.splice(deleteIndex, 1);
    saveTodosToLocalStorage();
    renderTodos();
}

function getTodoStatus(todo) {
    if (!todo.deadline) return 'Upcoming';
    const today = new Date();
    const dueDate = new Date(todo.deadline);
    today.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);
    const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    return 'Upcoming';
}

function renderTodos() {
    todoItemsContainer.innerHTML = '';
    let filtered = todoList.filter(todo => {
        if (priorityFilter && priorityFilter.value !== 'All' && todo.priority !== priorityFilter.value) {
            return false;
        }
        if (statusFilter && statusFilter.value !== 'All' && getTodoStatus(todo) !== statusFilter.value) {
            return false;
        }
        return true;
    });
    for (let todo of filtered) {
        createAndAppendTodo(todo);
    }
}

function createAndAppendTodo(todo, container = todoItemsContainer) {
    let todoId = 'todo' + todo.uniqueNo;
    let checkboxId = 'checkbox' + todo.uniqueNo;
    let card = document.createElement("div");
    card.className = "task-card";
    card.id = todoId;
    container.appendChild(card);

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = checkboxId;
    checkbox.checked = todo.isChecked;
    checkbox.className = "checkbox-input";
    checkbox.onclick = function() {
        onTodoStatusChange(checkboxId, `label${todo.uniqueNo}`, todoId);
        renderTodos();
    };
    card.appendChild(checkbox);

    let info = document.createElement("div");
    info.className = "task-info";
    card.appendChild(info);

    if (todo.isEditing) {
        let titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = todo.text;
        titleInput.className = "form-control mb-2";
        info.appendChild(titleInput);
        let prioritySelect = document.createElement("select");
        prioritySelect.className = "form-control mb-2";
        ["Low", "Medium", "High"].forEach(opt => {
            let o = document.createElement("option");
            o.value = o.textContent = opt;
            if (todo.priority === opt) o.selected = true;
            prioritySelect.appendChild(o);
        });
        info.appendChild(prioritySelect);
        let deadlineInput = document.createElement("input");
        deadlineInput.type = "date";
        deadlineInput.value = todo.deadline || "";
        deadlineInput.className = "form-control mb-2";
        info.appendChild(deadlineInput);
        let saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.className = "btn btn-success btn-sm mr-2";
        saveBtn.onclick = function() {
            todo.text = titleInput.value.trim();
            todo.priority = prioritySelect.value;
            todo.deadline = deadlineInput.value;
            todo.isEditing = false;
            saveTodosToLocalStorage();
            renderTodos();
        };
        let cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.className = "btn btn-secondary btn-sm";
        cancelBtn.onclick = function() {
            todo.isEditing = false;
            renderTodos();
        };
        info.appendChild(saveBtn);
        info.appendChild(cancelBtn);
    } else {
        let title = document.createElement("div");
        title.className = "task-title";
        title.textContent = todo.text;
        info.appendChild(title);
        let metaRow = document.createElement("div");
        metaRow.className = "task-meta-row";
        let badge = document.createElement("span");
        let priority = (todo.priority || "Medium").toLowerCase();
        badge.className = `badge-priority badge-${priority}`;
        badge.textContent = todo.priority || "Medium";
        metaRow.appendChild(badge);
        let deadline = document.createElement("span");
        deadline.className = "task-deadline";
        deadline.innerHTML = `<i class='far fa-calendar-alt' style='margin-right:4px;'></i>${todo.deadline || "N/A"}`;
        metaRow.appendChild(deadline);
        let status = document.createElement("span");
        if (todo.deadline) {
            let today = new Date();
            let dueDate = new Date(todo.deadline);
            today.setHours(0,0,0,0);
            dueDate.setHours(0,0,0,0);
            let diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (diff < 0) {
                status.className = "status-overdue";
                status.innerHTML = `<i class='fas fa-exclamation-circle'></i> Overdue`;
            } else if (diff === 0) {
                status.className = "status-due";
                status.innerHTML = `<i class='fas fa-hourglass-half'></i> Due today`;
            } else {
                status.className = "status-due";
                status.innerHTML = `<i class='fas fa-hourglass-half'></i> Due in ${diff} day${diff > 1 ? 's' : ''}`;
            }
            metaRow.appendChild(status);
        }
        info.appendChild(metaRow);
    }
    let actions = document.createElement("div");
    actions.className = "task-actions";
    let editBtn = document.createElement("button");
    editBtn.className = "task-action-btn";
    editBtn.title = "Edit";
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: #e5e3dc;"></i>';
    editBtn.onclick = function() {
        todo.isEditing = true;
        renderTodos();
    };
    actions.appendChild(editBtn);
    let deleteBtn = document.createElement("button");
    deleteBtn.className = "task-action-btn";
    deleteBtn.title = "Delete";
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt" style="color: #e5e3dc;"></i>';
    deleteBtn.onclick = function() {
        onDeleteTodo(todoId);
        renderTodos();
    };
    actions.appendChild(deleteBtn);
    card.appendChild(actions);
}


function onAddTodo() {
    let titleElement = document.getElementById("taskTitle");
    let priorityElement = document.getElementById("taskPriority");
    let deadlineElement = document.getElementById("taskDeadline");

    let titleValue = titleElement.value.trim();
    let priorityValue = priorityElement.value;
    let deadlineValue = deadlineElement.value;

    if (titleValue === "") {
        alert("Enter a valid task title");
        return;
    }

    todosCount = todosCount + 1;

    let newTodo = {
        text: titleValue,
        priority: priorityValue,
        deadline: deadlineValue,
        uniqueNo: todosCount,
        isChecked: false
    };
    todoList.push(newTodo);

    titleElement.value = "";
    priorityElement.value = "Medium";
    deadlineElement.value = "";
    saveTodosToLocalStorage();
    renderTodos();
}

renderTodos();

if (statusFilter) statusFilter.addEventListener('change', renderTodos);
if (priorityFilter) priorityFilter.addEventListener('change', renderTodos);

addTodoButton.onclick = function() {
    onAddTodo();
}