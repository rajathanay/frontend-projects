const taskInput = document.getElementById("task-input");

const addTaskButton = document.getElementById("add-task");

const taskList = document.getElementById("task-list");

const errorMessage = document.getElementById("error-message");

const taskCount = document.getElementById("task-count");

const clearCompletedButton = document.getElementById("clear-completed");

const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];

let currentFilter = "all";

const saveTasks = () => {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
};

const addTask = () => {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    errorMessage.textContent = "Please enter a task.";

    return;
  }

  errorMessage.textContent = "";

  const newTask = {
    id: Date.now(),

    text: taskText,

    completed: false,
  };

  tasks.push(newTask);

  saveTasks();

  displayTasks();

  taskInput.value = "";

  taskInput.focus();
};

const displayTasks = () => {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  if (filteredTasks.length === 0) {
    const message = document.createElement("li");

    message.textContent = "No tasks found.";

    message.classList.add("empty-message");

    taskList.appendChild(message);

    updateTaskCount();

    return;
  }

  filteredTasks.forEach((task) => {
    const listItem = document.createElement("li");

    listItem.classList.add("task-item");

    if (task.completed) {
      listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      toggleTask(task.id);
    });

    const taskText = document.createElement("span");

    taskText.textContent = task.text;

    taskText.classList.add("task-text");

    const editButton = document.createElement("button");

    editButton.textContent = "Edit";

    editButton.type = "button";

    editButton.classList.add("edit-btn");

    editButton.addEventListener("click", () => {
      editTask(task.id);
    });

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.type = "button";

    deleteButton.classList.add("delete-btn");

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    listItem.appendChild(checkbox);

    listItem.appendChild(taskText);

    listItem.appendChild(editButton);

    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);
  });

  updateTaskCount();
};

const toggleTask = (id) => {
  const task = tasks.find((task) => task.id === id);

  if (task) {
    task.completed = !task.completed;

    saveTasks();

    displayTasks();
  }
};

const editTask = (id) => {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  const newTaskText = window.prompt("Edit your task:", task.text);

  if (newTaskText === null) {
    return;
  }

  const updatedTask = newTaskText.trim();

  if (updatedTask === "") {
    alert("Task cannot be empty.");

    return;
  }

  task.text = updatedTask;

  saveTasks();

  displayTasks();
};

const deleteTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  displayTasks();
};

const updateTaskCount = () => {
  const remainingTasks = tasks.filter((task) => !task.completed);

  const count = remainingTasks.length;

  if (count === 1) {
    taskCount.textContent = "1 task remaining";
  } else {
    taskCount.textContent = `${count} tasks remaining`;
  }
};

const clearCompletedTasks = () => {
  tasks = tasks.filter((task) => !task.completed);

  saveTasks();

  displayTasks();
};

const changeFilter = (filter) => {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.remove("active");

    if (button.dataset.filter === filter) {
      button.classList.add("active");
    }
  });

  displayTasks();
};

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeFilter(button.dataset.filter);
  });
});

clearCompletedButton.addEventListener("click", clearCompletedTasks);

displayTasks();
