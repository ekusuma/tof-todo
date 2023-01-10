// Array to hold todo list items
let todoItems = [];

// Function to render each todo object on the screen
function renderTodo(todo) {
    // Save list to browser localstorage
    localStorage.setItem('todoItemsRef', JSON.stringify(todoItems));

    // Select first element with class named 'js-todo-list'
    const list = document.querySelector('.js-todo-list');
    // Select item in list if todo exists within it
    const item = document.querySelector(`[data-key='${todo.id}']`);

    // If item is deleted, remove from DOM
    if (todo.deleted) {
        item.remove();
        // Clear whitespace from list container if no elements in list are left
        if (todoItems.length === 0)
            list.innerHTML = '';
        return;
    }

    // Additional string is 'done' if checked, and '' otherwise
    const isChecked = todo.checked ? 'done' : '';
    // Create `li` element
    const node = document.createElement("li");
    // Set class attribute
    node.setAttribute('class', `todo-item ${isChecked}`);
    // Set data-key attribute to id of todo object
    node.setAttribute('data-key', todo.id);
    // Set contents of `li` node element
    node.innerHTML = `
        <input id="${todo.id}" type="checkbox"/>
        <label for="${todo.id}" class="tick js-tick"></label>
        <span>${todo.text}</span>
        <button class="delete-todo js-delete-todo">
            <svg><use href="#delete-icon"></use></svg>
        </button>
    `;

    // Append element to DOM as last child of element referenced by `list` variable
    if (item) {     // todo item exists within list
        list.replaceChild(node, item);
    } else {
        list.append(node);
    }
}

// Function to create new todo object
function addTodo(text) {
    const todo = {
        text,
        checked: false,
        id: Date.now(),
    };

    todoItems.push(todo);
    //console.log(todoItems);
    renderTodo(todo);
}

// Toggle the done state of todo item
function toggleDone(key) {
    // Look for position of element with id==key
    const index = todoItems.findIndex(item => item.id === Number(key));
    todoItems[index].checked = !todoItems[index].checked;
    renderTodo(todoItems[index]);
}

// Delete the todo item
function deleteTodo(key) {
    // Look for todo object in list
    const index = todoItems.findIndex(item => item.id === Number(key));
    // Create temporary todo item with same attributes, but addl deleted attr
    const todo = {
        deleted: true,
        ...todoItems[index]
    };
    // Remove item from array via filter method
    todoItems = todoItems.filter(item => item.id !== Number(key));
    renderTodo(todo);
}

// Select form element
const form = document.querySelector('.js-form');
// Add submit event listener
form.addEventListener('submit', event => {
    // Prevent page refresh on form submission
    event.preventDefault();
    // Select text input
    const input = document.querySelector('.js-todo-input');

    // Get value of input and strip whitespace
    const text = input.value.trim();
    if (text !== '') {
        addTodo(text);
        input.value = '';
        input.focus();
    };
});

// Select entire list
const list = document.querySelector('.js-todo-list');
// Add click event listener to list and its children
list.addEventListener('click', event => {
    // Check if clicked on done button
    if (event.target.classList.contains('js-tick')) {
        const itemKey = event.target.parentElement.dataset.key;
        toggleDone(itemKey);
    }
    // Check if clicked on delete button
    if (event.target.classList.contains('js-delete-todo')) {
        const itemKey = event.target.parentElement.dataset.key;
        deleteTodo(itemKey);
    }
});

// Load list in localstorage if it exists
document.addEventListener('DOMContentLoaded', () => {
    const ref = localStorage.getItem('todoItemsRef');
    if (ref) {
        todoItems = JSON.parse(ref);
        todoItems.forEach(t => {
            renderTodo(t);
        });
    }
});
