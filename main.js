// Version of website
var SITE_VER = "1.0.0";

// Integer mapping for each list
var TODO_MISC   = 0;
var TODO_DAILY  = 1;
var TODO_WEEKLY = 2;

// Array to hold todo list items
let todoItems = [];
const DEF__dailyItems = [
    {
        text: 'Sign-In rewards',
        checked: false,
        id: 0,
    },
    {
        text: 'Daily Bounties (4x)',
        checked: false,
        id: 1,
    },
    {
        text: 'Spend Vitality',
        checked: false,
        id: 2,
    },
    {
        text: 'Mia\'s Kitchen (3x)',
        checked: false,
        id: 3,
    },
    {
        text: 'Vehicle Maintenance',
        checked: false,
        id: 4,
    },
    {
        text: 'Crew Donation',
        checked: false,
        id: 5,
    },
    {
        text: 'Support Points (cap. 1500)',
        checked: false,
        id: 6,
    },
];
const DEF__weeklyItems = [
    {
        text: 'Weekly Challenges (up to 950 points)',
        checked: false,
        id: 100,
    },
    {
        text: 'RAID (3x)',
        checked: false,
        id: 101,
    },
    {
        text: 'Bygone Phantasm',
        checked: false,
        id: 102,
    },
    {
        text: 'Void Rifts',
        checked: false,
        id: 103,
    },
    {
        text: 'Crew Missions (4x)',
        checked: false,
        id: 104,
    },
    {
        text: 'Security Force',
        checked: false,
        id: 105,
    },
    {
        text: 'Dream Machines',
        checked: false,
        id: 106,
    },
    {
        text: '<b>[Island]</b> Kill bosses',
        checked: false,
        id: 107,
    },
    {
        text: '<b>[Island]</b> Clear mobs',
        checked: false,
        id: 108,
    },
    {
        text: '<b>[Island]</b> Buy shop items',
        checked: false,
        id: 109,
    },
    {
        text: '<b>[Commissary][Crystal Dust]</b> Booster Module',
        checked: false,
        id: 110,
    },
    {
        text: '<b>[Commissary][Crystal Dust]</b> Advancement Module',
        checked: false,
        id: 111,
    },
    {
        text: '<b>[Commissary][Crystal Dust]</b> Potent Omnium Crystal II',
        checked: false,
        id: 112,
    },
    {
        text: '<b>[Commissary][Crystal Dust]</b> Vera Special Gift',
        checked: false,
        id: 113,
    },
    {
        text: '<b>[Commissary][Spacetime]</b> Data Repeater',
        checked: false,
        id: 114,
    },
    {
        text: '<b>[Commissary][Spacetime]</b> Advancement Module II',
        checked: false,
        id: 115,
    },
    {
        text: '<b>[Commissary][Spacetime]</b> Booster Module II',
        checked: false,
        id: 116,
    },
];
var dailyItems = [];
var weeklyItems = [];

// Function to convert user timezone to PT
function changeTZToPT(date) {
    // We use "Etc/GMT+8" because we want to be DST-agnostic
    if (typeof date === 'string') {
        return new Date(
            new Date(date).toLocaleString('en-US', {
                timeZone: "Etc/GMT+8",
            }),
        );
    }

    return new Date(
        date.toLocaleString('en-US', {
            timeZone: "Etc/GMT+8",
        }),
    );
}

// Function to get next reset from current time
//      Weekly reset is: Mondays, 02:00 (PT)
//      Daily reset is: 2:00 (PT)
function getReset(period) {
    // Convert to PT
    const date = new Date();
    const currDate = changeTZToPT(date);
    var nextReset = null;
    if (period === 'weekly') {
        // If today is Monday before 02:00 (PT), the "next" Monday is today
        if (currDate.getDay() === 1 && currDate.getHours() < 2) {
            nextReset = new Date(currDate.getTime());
        } else {
            nextReset = new Date();
            nextReset.setDate(nextReset.getDate() + (((1 + 7 - nextReset.getDay()) % 7) || 7));
        }
    } else if (period === 'daily') {
        // Check if time is before 02:00 (PT)
        if (currDate.getHours() < 2) {
            nextReset = new Date(currDate.getTime());
        } else {
            nextReset = new Date();
            nextReset.setDate(nextReset.getDate() + 1);
        }
    }
    // Reset time to 02:00
    nextReset.setHours(2);
    nextReset.setMinutes(0);
    nextReset.setSeconds(0);
    nextReset.setMilliseconds(0);

    return nextReset;
}

// Function to automatically convert time to PT and check if reset passed
// Assumes that resetDate is in PT already
function isReset(currDate, resetDate) {
    const date = changeTZToPT(currDate);
    return date.getTime() > resetDate.getTime();
}

// Force a render of lists
function renderList(listNum) {
    switch (listNum) {
        case TODO_DAILY:
            dailyItems.forEach(todo => {
                renderTodo(todo, listNum=TODO_DAILY);
            });
            break;
        case TODO_WEEKLY:
            weeklyItems.forEach(todo => {
                renderTodo(todo, listNum=TODO_WEEKLY);
            });
            break;
        default:
            console.error("Invalid argument for renderList()");
            break;
    }
}

// Function to render each todo object on the screen
// Return false if a reset happened, true otherwise
function renderTodo(todo, listNum=TODO_MISC, sync=true) {
    const currDate = new Date();
    // Get next expected weekly reset time
    const refWeeklyReset = localStorage.getItem('dateNextResetWeekly');
    const nextResetWeekly = (refWeeklyReset) ? new Date(refWeeklyReset) : null;
    // Get next expected daily reset time
    const refDailyReset = localStorage.getItem('dateNextResetDaily');
    const nextResetDaily = (refDailyReset) ? new Date(refDailyReset) : null;

    const needWeeklyReset = nextResetWeekly && isReset(currDate, nextResetWeekly);
    const needDailyReset = nextResetDaily && isReset(currDate, nextResetDaily);
    if (needWeeklyReset) {          // daily + weekly reset
        window.alert("Weekly reset has passed! Resetting weeklies and dailies...");
        // Update last modified time early, so this check won't happen next call
        localStorage.setItem('dateNextResetWeekly', getReset('weekly'));
        localStorage.setItem('dateNextResetDaily', getReset('daily'));
        initList(TODO_WEEKLY);
        initList(TODO_DAILY);
        renderList(TODO_WEEKLY);
        renderList(TODO_DAILY);
        return false;
    } else if (needDailyReset) {    // daily reset only
        window.alert("Daily reset has passed! Resetting dailies...");
        localStorage.setItem('dateNextResetDaily', getReset('daily'));
        initList(TODO_DAILY);
        renderList(TODO_DAILY);
        return false;
    }
    // Save list to browser localstorage
    if (sync) {
        switch (listNum) {
            case TODO_DAILY:
                localStorage.setItem('todoItemsRefDaily', JSON.stringify(dailyItems));
                break;
            case TODO_WEEKLY:
                localStorage.setItem('todoItemsRefWeekly', JSON.stringify(weeklyItems));
                break;
            default:
                localStorage.setItem('todoItemsRef', JSON.stringify(todoItems));
                break;
        }
    }

    // Select element based on what kind of list we're looking for
    const list = (()=> {
        switch (listNum) {
            case TODO_DAILY:
                return document.querySelector('.js-todo-list-daily');
            case TODO_WEEKLY:
                return document.querySelector('.js-todo-list-weekly');
            default:
                return document.querySelector('.js-todo-list');
        }
    })();
    // Select item in list if todo exists within it
    const item = document.querySelector(`[data-key='${todo.id}']`);

    // If item is deleted, remove from DOM
    if (todo.deleted) {
        item.remove();
        // Clear whitespace from list container if no elements in list are left
        if (todoItems.length === 0 && dailyItems.length === 0 && weeklyItems.length === 0)
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
        <!--
        <button class="delete-todo js-delete-todo">
            <svg><use href="#delete-icon"></use></svg>
        </button>
        -->
    `;

    // Append element to DOM as last child of element referenced by `list` variable
    if (item) {     // todo item exists within list
        list.replaceChild(node, item);
    } else {
        list.append(node);
    }

    // Update next reset times
    localStorage.setItem('dateNextResetWeekly', getReset('weekly'));
    localStorage.setItem('dateNextResetDaily', getReset('daily'));
    return true;
}

// Initialize static/hardcoded todo items
function initList(listNum) {
    switch (listNum) {
        case TODO_DAILY:
            dailyItems = DEF__dailyItems.map(a => {return {...a}});
            break;
        case TODO_WEEKLY:
            weeklyItems = DEF__weeklyItems.map(a => {return {...a}});
            break;
        default:
            console.error("Invalid argument for initList()");
            break;
    }
}

// Function to create new todo object
function addTodo(text, listNum=TODO_MISC) {
    const list = (()=> {
        switch (listNum) {
            case TODO_DAILY:
                return dailyItems;
            case TODO_WEEKLY:
                return weeklyItems;
            default:
                return todoItems;
        }
    })();
    const todo = {
        text,
        checked: false,
        id: Date.now(),
    };

    list.push(todo);
    renderTodo(todo, listNum=listNum);
}

// Toggle the done state of todo item
function toggleDone(key, listNum=TODO_MISC) {
    const list = (()=> {
        switch (listNum) {
            case TODO_DAILY:
                return dailyItems;
            case TODO_WEEKLY:
                return weeklyItems;
            default:
                return todoItems;
        }
    })();
    // Look for position of element with id==key
    const index = list.findIndex(item => item.id === Number(key));
    list[index].checked = !list[index].checked;
    const ret = renderTodo(list[index], listNum=listNum);
    // Retry render if a reset happened
    if (!ret)
        renderList(listNum);
}

// Delete the todo item
function deleteTodo(key, listNum=TODO_MISC) {
    const list = (()=> {
        switch (listNum) {
            case TODO_DAILY:
                return dailyItems;
            case TODO_WEEKLY:
                return weeklyItems;
            default:
                return todoItems;
        }
    })();
    // Look for todo object in list
    const index = list.findIndex(item => item.id === Number(key));
    // Create temporary todo item with same attributes, but addl deleted attr
    const todo = {
        deleted: true,
        ...list[index]
    };
    // Remove item from array via filter method
    list = list.filter(item => item.id !== Number(key));
    renderTodo(todo, listNum=listNum);
}

// Need this if we want to support custom todo items
/*
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
*/

// List click listener function
function listClickListener(event, list) {
    // Check if clicked on done button
    if (event.target.classList.contains('js-tick')) {
        const itemKey = event.target.parentElement.dataset.key;
        toggleDone(itemKey, list);
    }
    // Check if clicked on delete button
    if (event.target.classList.contains('js-delete-todo')) {
        const itemKey = event.target.parentElement.dataset.key;
        deleteTodo(itemKey, list);
    }
}

// Select entire list
const list = document.querySelector('.js-todo-list');
const dailyList = document.querySelector('.js-todo-list-daily');
const weeklyList = document.querySelector('.js-todo-list-weekly');
// Add click event listener to list and its children
list.addEventListener('click', ()=>{ listClickListener(event, TODO_MISC) });
dailyList.addEventListener('click', ()=>{ listClickListener(event, TODO_DAILY) });
weeklyList.addEventListener('click', ()=>{ listClickListener(event, TODO_WEEKLY) });
/*
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
*/

// Load list in localstorage if it exists
document.addEventListener('DOMContentLoaded', () => {
    const ref = localStorage.getItem('todoItemsRef');
    const refDaily = localStorage.getItem('todoItemsRefDaily');
    const refWeekly = localStorage.getItem('todoItemsRefWeekly');
    if (ref) {
        todoItems = JSON.parse(ref);
        todoItems.forEach(t => {
            renderTodo(t);
        });
    }
    // If missing either daily or weekly in localstorage, init render
    if (refDaily) {
        dailyItems = JSON.parse(refDaily);
    } else {
        initList(TODO_DAILY);
    }
    renderList(TODO_DAILY);
    if (refWeekly) {
        weeklyItems = JSON.parse(refWeekly);
    } else {
        initList(TODO_WEEKLY);
    }
    renderList(TODO_WEEKLY);

    // Log site version in localstorage
    localStorage.setItem('siteVer', SITE_VER);
});
