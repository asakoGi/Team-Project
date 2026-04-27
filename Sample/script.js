/* ============================================ */
/* タスク管理アプリの動作                         */
/* ============================================ */

let taskList = [];
let currentCalendarDate = new Date();
let selectedDate = formatDateToString(new Date());

const STORAGE_KEY = "aiPassportTaskList";

/* ============================================ */
/* 共通関数                                      */
/* ============================================ */

function formatDateToString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDateToJapanese(dateString) {
    const dateObj = new Date(`${dateString}T00:00:00`);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekdayList = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdayList[dateObj.getDay()];

    return `${year}年${month}月${day}日(${weekday})`;
}

/* ============================================ */
/* localStorage                                  */
/* ============================================ */

function saveTaskList() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
}

function loadTaskList() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
        taskList = JSON.parse(savedData);
    }
}

/* ============================================ */
/* タスクの追加・削除・完了                       */
/* ============================================ */

function addTask() {
    const taskTitle = document.getElementById("taskTitle").value.trim();
    const executeDate = document.getElementById("executeDate").value;
    const executeTime = document.getElementById("executeTime").value;
    const deadlineDate = document.getElementById("deadlineDate").value;
    const chapter = document.getElementById("chapterSelect").value;
    const section = document.getElementById("sectionSelect").value;

    if (taskTitle === "") {
        alert("タスク名を入力してください");
        return;
    }

    if (chapter === "") {
        alert("章を選択してください（テスト日や質問など章に属さないものは「その他」を選択）");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: taskTitle,
        executeDate,
        executeTime,
        deadlineDate,
        chapter,
        section,
        done: false
    };

    taskList.push(newTask);
    saveTaskList();
    renderAll();
    clearInputs();
}

function clearInputs() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("executeDate").value = "";
    document.getElementById("executeTime").value = "";
    document.getElementById("deadlineDate").value = "";
    document.getElementById("chapterSelect").value = "";
    document.getElementById("sectionSelect").value = "";
}

function deleteTask(id) {
    taskList = taskList.filter((task) => task.id !== id);
    saveTaskList();
    renderAll();
}

function toggleTaskDone(id) {
    const task = taskList.find((task) => task.id === id);

    if (task) {
        task.done = !task.done;
    }

    saveTaskList();
    renderAll();
}

/* ============================================ */
/* タスク一覧の描画                               */
/* ============================================ */

function createChapterGroup(chapterValue, chapterLabel, isOther) {
    const tasksInChapter = taskList.filter((task) => task.chapter === chapterValue);
    const totalCount = tasksInChapter.length;
    const doneCount = tasksInChapter.filter((task) => task.done).length;
    const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const chapterGroup = document.createElement("div");
    chapterGroup.className = "chapter-group";

    if (isOther) {
        chapterGroup.classList.add("other-group");
    }

    const chapterHeader = document.createElement("div");
    chapterHeader.className = "chapter-header";

    const chapterTitle = document.createElement("span");
    chapterTitle.className = "chapter-title";

    if (isOther) {
        chapterTitle.classList.add("other-title");
    }

    chapterTitle.textContent = chapterLabel;

    const progressBarWrap = document.createElement("div");
    progressBarWrap.className = "progress-bar-wrap";

    const progressBarFill = document.createElement("div");
    progressBarFill.className = "progress-bar-fill";
    progressBarFill.style.width = `${progressPercent}%`;

    progressBarWrap.appendChild(progressBarFill);

    const progressPercentText = document.createElement("span");
    progressPercentText.className = "progress-percent";
    progressPercentText.textContent = `${progressPercent}%`;

    chapterHeader.appendChild(chapterTitle);
    chapterHeader.appendChild(progressBarWrap);
    chapterHeader.appendChild(progressPercentText);

    const chapterTasks = document.createElement("div");
    chapterTasks.className = "chapter-tasks";

    if (tasksInChapter.length === 0) {
        const noTaskMessage = document.createElement("div");
        noTaskMessage.className = "no-task-message";
        noTaskMessage.textContent = "タスクがありません";
        chapterTasks.appendChild(noTaskMessage);
    } else {
        tasksInChapter.forEach((task) => {
            const taskItem = document.createElement("div");
            taskItem.className = "task-item";

            if (task.done) {
                taskItem.classList.add("done");
            }

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = task.done;
            checkbox.addEventListener("change", () => toggleTaskDone(task.id));

            const titleSpan = document.createElement("span");
            titleSpan.className = "task-title";
            titleSpan.textContent = task.title;

            const metaSpan = document.createElement("span");
            metaSpan.className = "task-meta";
            metaSpan.textContent = createTaskMetaText(task);

            const deleteButton = document.createElement("button");
            deleteButton.className = "task-delete-button";
            deleteButton.type = "button";
            deleteButton.textContent = "削除";
            deleteButton.addEventListener("click", () => deleteTask(task.id));

            taskItem.appendChild(checkbox);
            taskItem.appendChild(titleSpan);
            taskItem.appendChild(metaSpan);
            taskItem.appendChild(deleteButton);
            chapterTasks.appendChild(taskItem);
        });
    }

    chapterGroup.appendChild(chapterHeader);
    chapterGroup.appendChild(chapterTasks);

    return chapterGroup;
}

function createTaskMetaText(task) {
    let metaText = "";

    if (task.section) {
        metaText += `セクション${task.section} `;
    }

    if (task.executeTime) {
        metaText += `${task.executeTime} `;
    }

    if (task.deadlineDate) {
        metaText += `期限:${task.deadlineDate}`;
    }

    return metaText;
}

function renderTaskList() {
    const taskListElement = document.getElementById("taskList");
    taskListElement.innerHTML = "";

    for (let chapter = 1; chapter <= 5; chapter++) {
        const chapterGroup = createChapterGroup(String(chapter), `${chapter}章`, false);
        taskListElement.appendChild(chapterGroup);
    }

    const otherGroup = createChapterGroup("other", "その他", true);
    taskListElement.appendChild(otherGroup);
}

/* ============================================ */
/* カレンダーの描画                               */
/* ============================================ */

function renderCalendar() {
    const calendarElement = document.getElementById("calendar");
    const calendarTitleElement = document.getElementById("calendarTitle");

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    calendarTitleElement.textContent = `${year}年${month + 1}月`;
    calendarElement.innerHTML = "";

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    weekdays.forEach((weekday) => {
        const weekdayElement = document.createElement("div");
        weekdayElement.className = "calendar-weekday";
        weekdayElement.textContent = weekday;
        calendarElement.appendChild(weekdayElement);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    const todayStr = formatDateToString(new Date());
    const datesWithTask = getDatesWithTask();

    for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day other-month";
        dayElement.textContent = prevLastDate - i;
        calendarElement.appendChild(dayElement);
    }

    for (let day = 1; day <= lastDate; day++) {
        const dayElement = document.createElement("button");
        dayElement.type = "button";
        dayElement.className = "calendar-day";
        dayElement.textContent = day;

        const dateStr = formatDateToString(new Date(year, month, day));

        if (dateStr === todayStr) {
            dayElement.classList.add("today");
        }

        if (datesWithTask.includes(dateStr)) {
            dayElement.classList.add("has-task");
        }

        if (dateStr === selectedDate) {
            dayElement.classList.add("selected");
        }

        dayElement.addEventListener("click", () => {
            selectedDate = dateStr;
            renderCalendar();
            renderTimeline();
        });

        calendarElement.appendChild(dayElement);
    }

    const totalCells = firstDayWeekday + lastDate;
    const remainingCells = 42 - totalCells;

    for (let i = 1; i <= remainingCells; i++) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day other-month";
        dayElement.textContent = i;
        calendarElement.appendChild(dayElement);
    }
}

function getDatesWithTask() {
    const datesWithTask = [];

    taskList.forEach((task) => {
        if (task.executeDate) {
            datesWithTask.push(task.executeDate);
        }

        if (task.deadlineDate) {
            datesWithTask.push(task.deadlineDate);
        }
    });

    return datesWithTask;
}

function goToPrevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function goToNextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function backToToday() {
    selectedDate = formatDateToString(new Date());
    currentCalendarDate = new Date();
    renderCalendar();
    renderTimeline();
}

/* ============================================ */
/* タイムラインの描画                             */
/* ============================================ */

function renderTimeline() {
    const timelineElement = document.getElementById("timeline");
    const timelineTitleElement = document.getElementById("timelineTitle");

    timelineElement.innerHTML = "";
    timelineTitleElement.textContent = `タイムライン: ${formatDateToJapanese(selectedDate)}`;

    const selectedTasks = taskList.filter((task) => task.executeDate === selectedDate);

    for (let hour = 0; hour < 24; hour++) {
        const timelineRow = document.createElement("div");
        timelineRow.className = "timeline-row";

        const timeText = document.createElement("span");
        timeText.className = "timeline-time";
        timeText.textContent = `${String(hour).padStart(2, "0")}:00`;

        const tasksArea = document.createElement("div");
        tasksArea.className = "timeline-tasks";

        selectedTasks.forEach((task) => {
            if (!task.executeTime) {
                return;
            }

            const taskHour = parseInt(task.executeTime.substring(0, 2), 10);

            if (taskHour === hour) {
                const taskBadge = document.createElement("div");
                taskBadge.className = "timeline-task";
                taskBadge.textContent = `${task.executeTime} ${task.title}`;
                tasksArea.appendChild(taskBadge);
            }
        });

        timelineRow.appendChild(timeText);
        timelineRow.appendChild(tasksArea);
        timelineElement.appendChild(timelineRow);
    }

    renderNoTimeTasks(timelineElement, selectedTasks);
}

function renderNoTimeTasks(timelineElement, selectedTasks) {
    const noTimeTasks = selectedTasks.filter((task) => !task.executeTime);

    if (noTimeTasks.length === 0) {
        return;
    }

    const noTimeRow = document.createElement("div");
    noTimeRow.className = "timeline-row";

    const noTimeLabel = document.createElement("span");
    noTimeLabel.className = "timeline-time";
    noTimeLabel.textContent = "未設定";

    const noTimeArea = document.createElement("div");
    noTimeArea.className = "timeline-tasks";

    noTimeTasks.forEach((task) => {
        const taskBadge = document.createElement("div");
        taskBadge.className = "timeline-task no-time";
        taskBadge.textContent = task.title;
        noTimeArea.appendChild(taskBadge);
    });

    noTimeRow.appendChild(noTimeLabel);
    noTimeRow.appendChild(noTimeArea);
    timelineElement.appendChild(noTimeRow);
}

/* ============================================ */
/* 初期化                                        */
/* ============================================ */

function renderAll() {
    renderTaskList();
    renderCalendar();
    renderTimeline();
}

document.addEventListener("DOMContentLoaded", () => {
    loadTaskList();

    document.getElementById("addTaskButton").addEventListener("click", addTask);
    document.getElementById("prevMonth").addEventListener("click", goToPrevMonth);
    document.getElementById("nextMonth").addEventListener("click", goToNextMonth);
    document.getElementById("backToTodayButton").addEventListener("click", backToToday);

    renderAll();
});
