const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
console.log("Firebase initialisiert:", firebase);

async function initSummary() {
  await includeHTML();
  loadUserData();
  loadTasksFromFirebase();
}

function loadUserData() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    showUserGreeting(currentUser.firstName, currentUser.lastName);
  } else {
    console.error("Kein Benutzer im Local Storage gefunden.");
    window.location.href =
      "login.html?msg=" +
      encodeURIComponent("Bitte melden Sie sich erneut an.");
  }
}

function showUserGreeting(firstName, lastName) {
  const greetingName = document.getElementById("nameOfUser");
  if (greetingName) {
    greetingName.innerHTML = `<p>${firstName} ${lastName}</p>`;
  }
}

function loadTasksFromFirebase() {
  const tasksRef = db.ref("tasks");

  tasksRef.once("value", (snapshot) => {
    const tasks = snapshot.val();
    if (tasks) {
      calculateTaskSummary(Object.values(tasks));
    } else {
      console.error("Keine Aufgaben in der Firebase-Datenbank gefunden.");
    }
  });
}

function calculateTaskSummary(tasks) {
  const stats = {
    toDo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "inProgress").length,
    feedback: tasks.filter((t) => t.status === "feedback").length,
    done: tasks.filter((t) => t.status === "done").length,
    totalTasks: tasks.length,
    upcomingTask: findUpcomingDeadline(tasks),
  };

  renderPanels(stats);
}

function renderPanels(stats) {
  const panelContainer = document.getElementById("panelContainer");
  panelContainer.innerHTML = "";

  const panelsHTML = `
      <div class="panel-row">
        ${createPanel("To-do", stats.toDo, "./img/edit-pencil.png")}
        ${createPanel("Done", stats.done, "./img/done-mark.png")}
      </div>
      <div class="panel-row">
        ${createLargePanel(stats.upcomingTask)}
      </div>
      <div class="panel-row">
      ${createPanel("Tasks in Board", stats.totalTasks, null, "panel-bottom")}  
      ${createPanel(
        "Tasks in progress",
        stats.inProgress,
        null,
        "panel-bottom"
      )}
      ${createPanel("Awaiting Feedback", stats.feedback, null, "panel-bottom")}
      </div>
    `;
  panelContainer.innerHTML = panelsHTML;
}

function createPanel(title, value, imgSrc = "", extraClass = "") {
  return `
      <a href="testboard.html" class="panel-link">
        <div class="panel ${extraClass}">
          ${imgSrc ? `<img src="${imgSrc}" alt="${title} Icon" />` : ""}
          <div class="panel-content">
            <p>${value}</p>
            <span>${title}</span>
          </div>
        </div>
      </a>
    `;
}

function createLargePanel(upcomingTask) {
  const date = upcomingTask
    ? formatDate(new Date(upcomingTask.date))
    : "Keine Fristen verfügbar";
  const priority = upcomingTask ? upcomingTask.prio : "No priority";
  const priorityIcon = getPriorityIcon(priority);

  return `
      <a href="testboard.html" class="panel-link">
        <div class="panel large">
        <img class="panel-img-prio" src="${priorityIcon}" alt="${priority} Priority Icon" />
          <div class="panel-content">
            <p>${priority}</p>
            <span>Upcoming Task</span>
          </div>
          <div class="divider"></div>
          <div class="panel-right">
            <span>${date}</span>
            <br />
            <span>Upcoming Deadline</span>
          </div>
        </div>
      </a>
    `;
}

function getPriorityIcon(priority) {
  switch (priority) {
    case "urgent":
      return "./img/up-scale-orange.png";
    case "medium":
      return "./img/Prio_medium_color.svg";
    case "low":
      return "./img/Prio_low_color.svg";
  }
}

function findUpcomingDeadline(tasks) {
  const tasksWithDates = tasks
    .filter((t) => t.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return tasksWithDates.length > 0 ? tasksWithDates[0] : null;
}

function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
