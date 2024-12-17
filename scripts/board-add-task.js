const ADD_TASK_BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let categoriesContainerClick = false;
let contacts = [];
let selectedPriority = "";
let subtasksArr = [];
let assignedUserArr = [];
let localTasks = [];
let subtaskIdCounter = 0;
let subtasksEdit = [];
let subtasksEdit_done = [];
let subtasksArr_done = [];
let categoryObject = "";
let addTaskcategories = [
    { category: "User Story",
        "bg-color": "#0038FF",
      },
      {
        category: "Technical Task",
        "bg-color": "#1FD7C1",
      }];
  let assignedUser = [];
  let localStatus = "";


function getRandomColor() {
    const colors = ["orange", "purple", "blue", "red", "green", "teal"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

function showAddTask(status) {
    console.log("wird ausgeführt in " + "#" + status + "#") 
    localStatus = status;
    getTasks();
    let addTaskContent = document.getElementById('add-task-content');
    let background = document.getElementById('add-task-background');
    addTaskContent.classList.add('show-add-task');
    background.classList.remove('d-none');
    addTaskContent.innerHTML =  addTaskOverlayHTML();
    getUsers();
    setupDropdownInteraction();
}


function hideAddTask() {
    let addContactTemplate = document.getElementById('add-task-content');
    let background = document.getElementById('add-task-background');
    addContactTemplate.classList.remove('show-add-task');
    setTimeout(() => {
        background.classList.add('d-none');
      }, 1000);
    setTimeout(() => {
        window.location.href = "testboard.html";
      }, 1500);
}

async function createTask(status, event) {
    console.log(status);
    event.preventDefault();
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let date = document.getElementById('addTaskInputDueDate').value;
    const category = categoryObject;
    const priority = selectedPriority;
    const subtasks = [...subtasksArr];
    const assignedUsers = [...assignedUserArr];
    if (validateTask(title, date, category)) {
        return;
    }
    try {
        const nextId = await getNextTaskId();
        let newTask = {
            id: nextId,
            status: localStatus,
            title: title,
            description: description,
            date: date,
            taskCategory: category || "Undefined Category",
            prio: priority,
            subtasks: subtasks,
            owner: assignedUsers
        };
        taskArray.push(newTask);
        await pushTaskToFirebase(newTask);
        showAddTaskSuccesMessage();
        document.getElementById('add-task-background').classList.add('d-none');
            document.getElementById('add-task-content').classList.add('hide-add-task');
        setTimeout(() => {
            window.location.href = "testboard.html";
          }, 1500);
        
    } catch (error) {
        console.error("Failed to create the task:", error);
    }
}


function validateTask(title, date, category) { 
    let exits = false;
    if (!title) {
        document.getElementById('addTitleError').innerHTML = "Title is required!";
        setTimeout(() => {
            document.getElementById('addTitleError').innerHTML = "";
        }, 5000);
        exits = true;
    }
    if (!date) {
        document.getElementById('addDateError').innerHTML = "Date is required!";
        setTimeout(() => {
            document.getElementById('addDateError').innerHTML = "";
        }, 5000);
        exits = true;
    }
    if (!category) {
        document.getElementById('addCategoryError').innerHTML = "Category is required!";
        setTimeout(() => {
            document.getElementById('addCategoryError').innerHTML = "";
        }, 5000);
        exits = true;
    }
    return exits; 
}


async function getNextTaskId() {
    try {
        const response = await fetch(BASE_URL + "/tasks.json", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Error! Status: ${response.status}`);
        }
        const tasks = await response.json();
        const taskIds = tasks ? Object.values(tasks).map(task => task.id) : [];
        const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0;
        return maxId + 1;
    } catch (error) {
        console.error("Failed to fetch tasks for ID generation:", error);
        return 20;
    }
}

async function pushTaskToFirebase(newTask) {
    try {
        let key = newTask.id;  
        let response = await fetch(ADD_TASK_BASE_URL + `/tasks/${key}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });
        let responseToJson = await response.json();
        console.log("Task added", responseToJson);
    } catch (error) {
        console.error("Failed to add task:", error);
    }
}

function showAddTaskSuccesMessage() {
    let succes = document.getElementById('task-succes');
    succes.classList.add('show-add-task');
}


function handleDropdownInteraction() {
    const dropdown = document.getElementById('custom-dropdown');
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    const selectedUsers = [];

    dropdown.addEventListener('click', () => {
        const isOpen = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isOpen ? 'none' : 'block';
    });
    optionsContainer.addEventListener('change', (event) => {
        const checkbox = event.target;
        const userName = checkbox.parentElement.querySelector('span').textContent;

        if (checkbox.checked) {
            selectedUsers.push(userName);
        } else {
            const index = selectedUsers.indexOf(userName);
            if (index > -1) {
                selectedUsers.splice(index, 1);
            }
        }

        console.log('Selected users:', selectedUsers);
    });
}

async function getTasks() {
    try {
        let response = await fetch(ADD_TASK_BASE_URL + "/testingTasks/.json", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let responseToJson = await response.json();
        localTasks = responseToJson;
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

async function getUsers() {
    try {
        let response = await fetch(BASE_URL + "/contacts/.json", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let responseToJson = await response.json();
        console.log("Fetched Contacts:", responseToJson);
        finalContacts = responseToJson || {};
        console.log(finalContacts)
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
    returnArrayContacts()
}

function returnArrayContacts() {
    if (!finalContacts || Object.keys(finalContacts).length === 0) {
        console.error("No contacts found.");
        return;
    }
    console.log(finalContacts)
    const dropdown = document.getElementById('custom-dropdown');
    if (!dropdown) {
        console.error("Dropdown element not found.");
        return;
    }

    const optionsContainer = dropdown.querySelector('.dropdown-options');
    optionsContainer.innerHTML = ""; // Dropdown leeren

    Object.keys(finalContacts).forEach((key) => {
        const contactInDrop = finalContacts[key];

        if (!contactInDrop || !contactInDrop.firstName || !contactInDrop.lastName) return;
        const optionHTML = assignUserHTML(contactInDrop);

        const optionElement = document.createElement("div");
        optionElement.classList.add("dropdown-contact");
        optionElement.innerHTML = optionHTML;
        optionsContainer.appendChild(optionElement);
    });
}

function setupDropdownInteraction() {
    const dropdown = document.getElementById("custom-dropdown");
    const optionsContainer = dropdown.querySelector(".dropdown-options");

    dropdown.addEventListener("click", () => {
        const isOpen = optionsContainer.style.display === "block";
        optionsContainer.style.display = isOpen ? "none" : "block";
    });
}


function assignUser(firstName, lastName) {
    assignedUserArr.push({
        firstName: firstName,
        lastName: lastName,
        initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`
    });
    showAssignedUsers();
}

function showAssignedUsers() {
    let assignUsers = document.getElementById('assigned-users-short');
    assignUsers.innerHTML = "";
    for (let i=0; i < assignedUserArr.length; i++) {
        assignUsers.innerHTML += showAssignedUsersHTML(assignedUserArr[i]);
    }
}


function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}

function getCategory() {
    return categoryArr[0];
}

function openAddTaskCategories() {
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(180deg)";
    categoryList.innerHTML = "";
    if (!categoriesContainerClick) {
    categoriesContainerClick = true;
    categoryList.style.border = "1px solid #CDCDCD";
    renderAddTaskCategories();
    } else {
    categoriesContainerClick = false;
    categoryList.style.border = "0px";
    hideAddTaskCategories();
    }
    document.getElementById("categoryInput").classList.toggle("outline");}

function hideAddTaskCategories() {
    categoriesContainerClick = false;
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(0deg)";
    categoryList.innerHTML = "";
}

function renderAddTaskCategories() {
    let categoryContainer = document.getElementById("dropDownCategoryMenu");

    for (let i = 0; i < addTaskcategories.length; i++) {
    const category = addTaskcategories[i]["category"];

    categoryContainer.innerHTML += `
        <div class="addtask-category" onclick="selectAddTaskCategory('${category}')">
        ${category}
        </div>
        `;
    }
}
function selectAddTaskCategory(categoryTask) {
    let categoryInput = document.getElementById("categoryInput");
    let categoryList = document.getElementById("dropDownCategoryMenu");

    categoryInput.value = categoryTask;
    hideAddTaskCategories();
    categoryList.style.border = "0px";
    categoryObject = categoryTask;
}


function setPriority(priority) {
    const priorities = ['urgent', 'medium', 'low'];
    priorities.forEach((prio) => {
        const btn = document.getElementById(`prio-${prio}`);
        const img = document.getElementById(`prio-image-${prio}`);

        btn.classList.remove('red', 'yellow', 'green');
        img.classList.remove('sat-0');
    });
    const selectedButton = document.getElementById(`prio-${priority}`);
    const selectedImg = document.getElementById(`prio-image-${priority}`);

    if (priority === 'urgent') {
        selectedButton.classList.add('red');
    } else if (priority === 'medium') {
        selectedButton.classList.add('yellow');
    } else if (priority === 'low') {
        selectedButton.classList.add('green');
    }

    selectedImg.classList.add('sat-0');
    selectedPriority = priority;
}


function addSubtask() {
    
        const subtaskInput = document.getElementById("subtaskInput");
        const subtasksContent = document.getElementById("subtasksContent");
      
        if (subtaskInput.value.trim() !== "") {
          subtaskIdCounter++;
          const liId = "subtask-" + subtaskIdCounter;
          const spanId = "span-" + subtaskIdCounter;
          const inputId = "input-" + subtaskIdCounter;
          const newSubtaskHTML = /*html*/ `
          <li id="${liId}" class="subtask-item">
              <div class="dot"></div>
              <div class="subtask-text">
                  <span id="${spanId}" onclick="editSubtask('${liId}', '${spanId}', '${inputId}')">${subtaskInput.value}</span>
              </div>
              <div class="subtask-icon">
                  <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="../img/edit.svg" alt="edit">
                  <div class="divider"></div>
                  <img onclick="deleteSubtask('${liId}')" src="../img/delete.svg" alt="delete">
              </div>
          </li>
      `;
          subtasksArr.push({
            checkbox_img: "../assets/img/checkbox-empty.svg",
            subtask: `${subtaskInput.value}`,
          });
          subtasksEdit.push({
            checkbox_img: "../assets/img/checkbox-empty.svg",
            subtask: `${subtaskInput.value}`,
          });
          subtasksContent.innerHTML += newSubtaskHTML;
          subtaskInput.value = "";
        }
        document.getElementById("clear-add-icons").classList.add("d-none");
        document.getElementById("subtasks-plus-icon").classList.remove("d-none");
      
}

function editSubtask(liId, spanId, inputId) {
    const spanElement = document.getElementById(spanId);
    const li = document.getElementById(liId);
    const currentText = spanElement.textContent;
    const editSubtaskHTML = /*html*/ `
        <div class="subtask-input-wrapper edit-mode">
            <input id="${inputId}" class="edit-subtask-input" type="text" value="${currentText}">
            <div class="input-icons-edit">
                <img src ="../img/deletecopy.svg" onclick="deleteSubtask('${liId}')">
                <div class="divider"></div>
                <img src="../img/check1.svg" onclick="saveSubtask('${liId}', '${inputId}', '${spanId}')">
            </div>
        </div>
    `;
    li.innerHTML = editSubtaskHTML;
    li.classList.add("subtask-item-on-focus");
    li.classList.remove("subtask-item");
}

function deleteSubtask(liId) {
    const li = document.getElementById(liId);
    li.remove();
}
function saveSubtask(liId, inputId, spanId) {
    const li = document.getElementById(liId);
    const input = document.getElementById(inputId);
    const saveSubtaskHTML = `
          <div class="subtask-text">
              <div class="dot"></div>
              <span id="span-${liId}" onclick="editSubtask('${liId}', 'span-${liId}', 'input-${liId}')">${input.value}</span>
          </div>
          <div class="subtask-icon">
              <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="../img/edit.svg" alt="edit">
              <div class="divider"></div>
              <img id="deleteBtn-${liId}" onclick="deleteSubtask('${liId}')" src="../img/delete.svg" alt="delete">
          </div>
      `;
  
    li.innerHTML = saveSubtaskHTML;
    li.classList.remove("subtask-item-on-focus");
    li.classList.add("subtask-item");
  }
  function clearSubtaskInput() {
    document.getElementById("subtaskInput").value = "";
  }
  
  function clearSubtaskInput() {
    const input = document.getElementById("subtaskInput");
    input.value = "";
    document.getElementById("clearButton").style.display = "none";
  }
  
  function showClearButton() {
    document.getElementById("clear-add-icons").classList.remove("d-none");
    document.getElementById("subtasks-plus-icon").classList.add("d-none");
  }
  
  function clearImput() {
    document.getElementById("subtaskInput").value = "";
  }


function showClearButton() {
    document.getElementById("clear-add-icons").classList.remove("d-none");
    document.getElementById("subtasks-plus-icon").classList.add("d-none");
}

function clearSubtaskInput() {
    document.getElementById("subtaskInput").value = "";
}