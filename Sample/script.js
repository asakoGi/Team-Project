/* ============================================ */
/* script.js                                    */
/* このファイルは「動き」だけを担当します        */
/* HTMLの構造やCSSの見た目は含めません           */
/* バニラJavaScriptのみで実装(ライブラリ未使用)  */
/* ============================================ */


/* ====== タスクを保存しておく配列 ====== */
/* 全てのタスクをこの配列で管理する */
let taskList = [];


/* ====== カレンダーで表示中の年月を保存する変数 ====== */
/* 最初は今日の日付の月を表示する */
let currentCalendarDate = new Date();


/* ====== タイムラインで表示中の日付(YYYY-MM-DD形式の文字列) ====== */
/* カレンダーで日付をクリックするとここが切り替わる */
/* 最初は「今日」を表示する */
let selectedDate = formatDateToString(new Date());


/* ====== localStorageに保存するときのキー名 ====== */
/* この名前でブラウザのlocalStorageに保存する */
const STORAGE_KEY = "aiPassportTaskList";


/* ============================================ */
/* 共通の便利関数                                */
/* ============================================ */


/* ====== Dateオブジェクトを"YYYY-MM-DD"形式の文字列に変換する関数 ====== */
/* カレンダーやタイムラインで日付を比較するために使う */
function formatDateToString(dateObj) {
    /* 年を取得 */
    const year = dateObj.getFullYear();
    /* 月を2桁の文字列に変換(1月→"01") */
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    /* 日を2桁の文字列に変換 */
    const day = String(dateObj.getDate()).padStart(2, "0");
    /* "YYYY-MM-DD"形式で返す */
    return year + "-" + month + "-" + day;
}


/* ====== "YYYY-MM-DD"形式の文字列を読みやすい日本語表記に変換する関数 ====== */
/* 例: "2024-06-15" → "2024年6月15日(土)" */
function formatDateToJapanese(dateString) {
    /* 文字列をDateオブジェクトに変換 */
    /* "T00:00:00"を付けることでタイムゾーンの影響を防ぐ */
    const dateObj = new Date(dateString + "T00:00:00");
    /* 年・月・日を取り出す */
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    /* 曜日の文字を用意 */
    const weekdayList = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdayList[dateObj.getDay()];
    /* 「2024年6月15日(土)」のような文字列を返す */
    return year + "年" + month + "月" + day + "日(" + weekday + ")";
}


/* ============================================ */
/* localStorageの操作                            */
/* ============================================ */


/* ====== タスクをlocalStorageに保存する関数 ====== */
function saveTaskList() {
    /* taskListをJSON文字列に変換してlocalStorageに保存 */
    /* JSON.stringifyは配列やオブジェクトを文字列に変える命令 */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
}


/* ====== localStorageからタスクを読み込む関数 ====== */
function loadTaskList() {
    /* localStorageから保存されたデータを取り出す */
    const savedData = localStorage.getItem(STORAGE_KEY);
    /* 保存されたデータがあれば配列に変換してtaskListに入れる */
    if (savedData) {
        /* JSON.parseは文字列を配列やオブジェクトに戻す命令 */
        taskList = JSON.parse(savedData);
    }
}


/* ============================================ */
/* タスクの追加・削除・完了                      */
/* ============================================ */


/* ====== タスクを追加する関数 ====== */
function addTask() {
    /* 入力欄から値を取得する */
    const taskTitle = document.getElementById("taskTitle").value;
    const executeDate = document.getElementById("executeDate").value;
    /* 実行時間も取得する(タイムラインで使う) */
    const executeTime = document.getElementById("executeTime").value;
    const deadlineDate = document.getElementById("deadlineDate").value;
    const chapter = document.getElementById("chapterSelect").value;
    const section = document.getElementById("sectionSelect").value;
    const taskSize = document.getElementById("taskSize").value;

    /* タスクのタイトルが空のときはエラーメッセージを出して何もしない */
    if (taskTitle === "") {
        alert("タスク名を入力してください");
        return;
    }

    /* 章が選ばれていないときもエラーメッセージを出して何もしない */
    /* "other"(その他)も有効な選択肢として扱う */
    if (chapter === "") {
        alert("章を選択してください（テスト日や質問など章に属さないものは「その他」を選択）");
        return;
    }

    /* 新しいタスクのデータを作る */
    const newTask = {
        /* タスクを区別するためのID(現在時刻のミリ秒を使う) */
        id: Date.now(),
        /* タスクのタイトル */
        title: taskTitle,
        /* 実行日 */
        executeDate: executeDate,
        /* 実行時間(タイムラインで使う) */
        executeTime: executeTime,
        /* 期限 */
        deadlineDate: deadlineDate,
        /* 章("1"~"5"または"other") */
        chapter: chapter,
        /* セクション */
        section: section,
        /* タスクの大きさ */
        size: taskSize,
        /* 完了したかどうか(最初はfalse=未完了) */
        done: false
    };

    /* 作ったタスクを配列に追加する */
    taskList.push(newTask);

    /* localStorageに保存する */
    saveTaskList();

    /* 画面を更新する */
    renderAll();

    /* 入力欄をクリアする */
    clearInputs();
}


/* ====== 入力欄をクリアする関数 ====== */
function clearInputs() {
    /* 全ての入力欄を空にする */
    document.getElementById("taskTitle").value = "";
    document.getElementById("executeDate").value = "";
    /* 実行時間もクリアする */
    document.getElementById("executeTime").value = "";
    document.getElementById("deadlineDate").value = "";
    document.getElementById("chapterSelect").value = "";
    document.getElementById("sectionSelect").value = "";
    document.getElementById("taskSize").value = "";
}


/* ====== タスクを削除する関数 ====== */
/* 引数のidは削除したいタスクのID */
function deleteTask(id) {
    /* filterは条件に合う要素だけを残す命令 */
    /* IDが一致しないタスクだけを残す = 一致するタスクを削除する */
    taskList = taskList.filter(function(task) {
        return task.id !== id;
    });

    /* localStorageに保存する */
    saveTaskList();

    /* 画面を更新する */
    renderAll();
}


/* ====== タスクの完了状態を切り替える関数 ====== */
/* 引数のidは切り替えたいタスクのID */
function toggleTaskDone(id) {
    /* findは条件に合う最初の要素を見つける命令 */
    const task = taskList.find(function(task) {
        return task.id === id;
    });

    /* タスクが見つかったら完了状態を反転させる */
    if (task) {
        task.done = !task.done;
    }

    /* localStorageに保存する */
    saveTaskList();

    /* 画面を更新する */
    renderAll();
}


/* ============================================ */
/* タスク一覧の表示                              */
/* ============================================ */


/* ====== 1つの章(または「その他」)のグループを作る関数 ====== */
/* この関数を使うことで、章ごとと「その他」を同じ書き方で作れる */
/* 引数:                                                   */
/*   - chapterValue: 章の値("1"~"5"または"other")           */
/*   - chapterLabel: 画面に表示する文字(例:"1章"、"その他")  */
/*   - isOther:     その他カテゴリかどうか(true/false)      */
function createChapterGroup(chapterValue, chapterLabel, isOther) {
    /* この章に該当するタスクだけを抜き出す */
    const tasksInChapter = taskList.filter(function(task) {
        return task.chapter === chapterValue;
    });

    /* 進捗を計算する */
    const totalCount = tasksInChapter.length;
    const doneCount = tasksInChapter.filter(function(task) {
        return task.done;
    }).length;
    let progressPercent = 0;
    if (totalCount > 0) {
        progressPercent = Math.round((doneCount / totalCount) * 100);
    }

    /* 章のグループを作る */
    const chapterGroup = document.createElement("div");
    chapterGroup.className = "chapter-group";
    /* 「その他」の場合は専用クラスを追加して見た目を変える */
    if (isOther) {
        chapterGroup.classList.add("other-group");
    }

    /* 章のヘッダー部分を作る */
    const chapterHeader = document.createElement("div");
    chapterHeader.className = "chapter-header";

    /* 章のタイトル */
    const chapterTitle = document.createElement("span");
    chapterTitle.className = "chapter-title";
    /* 「その他」の場合は専用クラスを追加 */
    if (isOther) {
        chapterTitle.classList.add("other-title");
    }
    chapterTitle.textContent = chapterLabel;

    /* プログレスバーの外枠 */
    const progressBarWrap = document.createElement("div");
    progressBarWrap.className = "progress-bar-wrap";
    const progressBarFill = document.createElement("div");
    progressBarFill.className = "progress-bar-fill";
    progressBarFill.style.width = progressPercent + "%";
    progressBarWrap.appendChild(progressBarFill);

    /* パーセント表示 */
    const progressPercentText = document.createElement("span");
    progressPercentText.className = "progress-percent";
    progressPercentText.textContent = progressPercent + "%";

    /* ヘッダーに各要素を追加する */
    chapterHeader.appendChild(chapterTitle);
    chapterHeader.appendChild(progressBarWrap);
    chapterHeader.appendChild(progressPercentText);

    /* 章のタスクリスト部分を作る */
    const chapterTasks = document.createElement("div");
    chapterTasks.className = "chapter-tasks";

    /* タスクが無い場合のメッセージ */
    if (tasksInChapter.length === 0) {
        const noTaskMessage = document.createElement("div");
        noTaskMessage.className = "no-task-message";
        noTaskMessage.textContent = "タスクがありません";
        chapterTasks.appendChild(noTaskMessage);
    } else {
        /* タスクが1つ以上あれば1つずつ表示する */
        tasksInChapter.forEach(function(task) {
            /* 1つのタスクの要素を作る */
            const taskItem = document.createElement("div");
            taskItem.className = "task-item";
            if (task.done) {
                taskItem.classList.add("done");
            }

            /* チェックボックス */
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = task.done;
            checkbox.addEventListener("change", function() {
                toggleTaskDone(task.id);
            });

            /* タスクのタイトル */
            const titleSpan = document.createElement("span");
            titleSpan.className = "task-title";
            titleSpan.textContent = task.title;

            /* タスクの詳細(セクション、サイズ、期限などをまとめて表示) */
            const metaSpan = document.createElement("span");
            metaSpan.className = "task-meta";
            let metaText = "";
            if (task.section) {
                metaText += "セクション" + task.section + " ";
            }
            if (task.size) {
                let sizeText = "";
                if (task.size === "small") sizeText = "小";
                if (task.size === "medium") sizeText = "中";
                if (task.size === "large") sizeText = "大";
                metaText += "[" + sizeText + "] ";
            }
            /* 実行時間が設定されていれば表示する */
            if (task.executeTime) {
                metaText += task.executeTime + " ";
            }
            if (task.deadlineDate) {
                metaText += "期限:" + task.deadlineDate;
            }
            metaSpan.textContent = metaText;

            /* 削除ボタン */
            const deleteButton = document.createElement("button");
            deleteButton.className = "task-delete-button";
            deleteButton.type = "button";
            deleteButton.textContent = "削除";
            deleteButton.addEventListener("click", function() {
                deleteTask(task.id);
            });

            /* タスク要素に各要素を追加する */
            taskItem.appendChild(checkbox);
            taskItem.appendChild(titleSpan);
            taskItem.appendChild(metaSpan);
            taskItem.appendChild(deleteButton);

            chapterTasks.appendChild(taskItem);
        });
    }

    /* 章のグループにヘッダーとタスクリストを追加する */
    chapterGroup.appendChild(chapterHeader);
    chapterGroup.appendChild(chapterTasks);

    /* 完成したグループを返す */
    return chapterGroup;
}


/* ====== タスク一覧を画面に描画する関数 ====== */
function renderTaskList() {
    /* タスク一覧を表示する場所を取得 */
    const taskListElement = document.getElementById("taskList");

    /* 一旦中身を全部消す */
    taskListElement.innerHTML = "";

    /* 1章から5章まで順番に表示する */
    for (let chapter = 1; chapter <= 5; chapter++) {
        /* 章のグループを作って追加する */
        const chapterGroup = createChapterGroup(String(chapter), chapter + "章", false);
        taskListElement.appendChild(chapterGroup);
    }

    /* 「その他」の欄を最後に追加する */
    /* AIパスポート関連でテキスト以外のタスク(テスト日、質問など)を入れる場所 */
    const otherGroup = createChapterGroup("other", "その他", true);
    taskListElement.appendChild(otherGroup);
}


/* ============================================ */
/* カレンダーの表示                              */
/* ============================================ */


/* ====== カレンダーを画面に描画する関数 ====== */
function renderCalendar() {
    /* カレンダーを表示する場所を取得 */
    const calendarElement = document.getElementById("calendar");
    const calendarTitleElement = document.getElementById("calendarTitle");

    /* 表示中の年と月を取得 */
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth(); /* 月は0~11で扱われる */

    /* タイトルを更新する(例: "2024年6月") */
    calendarTitleElement.textContent = year + "年" + (month + 1) + "月";

    /* 一旦中身を全部消す */
    calendarElement.innerHTML = "";

    /* 曜日のヘッダーを作る */
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    weekdays.forEach(function(weekday) {
        const weekdayElement = document.createElement("div");
        weekdayElement.className = "calendar-weekday";
        weekdayElement.textContent = weekday;
        calendarElement.appendChild(weekdayElement);
    });

    /* 月の最初の日と最後の日を取得 */
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    const lastDate = lastDay.getDate();

    /* 前月の最後の日付を取得(月の最初の方の空白を埋めるため) */
    const prevLastDate = new Date(year, month, 0).getDate();

    /* 今日の日付を文字列で取得 */
    const todayStr = formatDateToString(new Date());

    /* タスクがある日付の一覧を作る */
    /* 実行日と期限日の両方をチェックする */
    const datesWithTask = [];
    taskList.forEach(function(task) {
        if (task.executeDate) {
            datesWithTask.push(task.executeDate);
        }
        if (task.deadlineDate) {
            datesWithTask.push(task.deadlineDate);
        }
    });

    /* ====== 前月の日付を表示(空白埋め) ====== */
    /* 前月の日付はクリックできないようにする(色も薄く表示) */
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day other-month";
        dayElement.textContent = prevLastDate - i;
        calendarElement.appendChild(dayElement);
    }

    /* ====== 当月の日付を表示 ====== */
    for (let day = 1; day <= lastDate; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        dayElement.textContent = day;

        /* この日の日付文字列を作る */
        const dateStr = formatDateToString(new Date(year, month, day));

        /* 今日の日付ならtodayクラスを追加 */
        if (dateStr === todayStr) {
            dayElement.classList.add("today");
        }

        /* タスクがある日付ならhas-taskクラスを追加 */
        /* 今日の日付の場合でも both 表示する(背景青+白ドット) */
        if (datesWithTask.includes(dateStr)) {
            dayElement.classList.add("has-task");
        }

        /* 今、選択されている日付ならselectedクラスを追加 */
        /* (緑の枠線で表示される) */
        if (dateStr === selectedDate) {
            dayElement.classList.add("selected");
        }

        /* この日付がクリックされたときの処理を登録する */
        /* クリックすると、タイムラインがその日の予定に切り替わる */
        dayElement.addEventListener("click", function() {
            /* 選択中の日付を更新する */
            selectedDate = dateStr;
            /* カレンダーとタイムラインを再描画する(タスク一覧は変わらないので再描画不要) */
            renderCalendar();
            renderTimeline();
        });

        calendarElement.appendChild(dayElement);
    }

    /* ====== 翌月の日付を表示(7×6=42マスを埋めるため) ====== */
    const totalCells = firstDayWeekday + lastDate;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day other-month";
        dayElement.textContent = i;
        calendarElement.appendChild(dayElement);
    }
}


/* ====== 前の月に移動する関数 ====== */
function goToPrevMonth() {
    /* 月を1つ減らす */
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    /* カレンダーを再描画する */
    renderCalendar();
}


/* ====== 次の月に移動する関数 ====== */
function goToNextMonth() {
    /* 月を1つ増やす */
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    /* カレンダーを再描画する */
    renderCalendar();
}


/* ====== 「今日に戻す」ボタンが押されたときの処理 ====== */
function backToToday() {
    /* 選択中の日付を今日にする */
    selectedDate = formatDateToString(new Date());
    /* カレンダーで表示中の月も今日の月にする */
    currentCalendarDate = new Date();
    /* カレンダーとタイムラインを再描画 */
    renderCalendar();
    renderTimeline();
}


/* ============================================ */
/* タイムラインの表示                            */
/* ============================================ */


/* ====== タイムラインを画面に描画する関数 ====== */
/* 選択中の日付(selectedDate)のタスクを24時間分(1時間刻み)で表示する */
function renderTimeline() {
    /* タイムラインを表示する場所を取得 */
    const timelineElement = document.getElementById("timeline");
    const timelineTitleElement = document.getElementById("timelineTitle");

    /* 一旦中身を全部消す */
    timelineElement.innerHTML = "";

    /* タイトルを更新する(選択中の日付を表示) */
    /* 例: 「タイムライン: 2024年6月15日(土)」 */
    timelineTitleElement.textContent = "タイムライン: " + formatDateToJapanese(selectedDate);

    /* 選択中の日付に実行日が一致するタスクを抽出 */
    const selectedTasks = taskList.filter(function(task) {
        return task.executeDate === selectedDate;
    });

    /* 0時から23時まで1時間刻みで表示 */
    /* 細かい予定が見やすいように4時間刻み→1時間刻みに変更 */
    for (let hour = 0; hour < 24; hour++) {
        /* 1行分の要素を作る */
        const timelineRow = document.createElement("div");
        timelineRow.className = "timeline-row";

        /* 時刻表示 */
        const timeText = document.createElement("span");
        timeText.className = "timeline-time";
        const hourStr = String(hour).padStart(2, "0");
        timeText.textContent = hourStr + ":00";

        /* タスク表示エリア */
        const tasksArea = document.createElement("div");
        tasksArea.className = "timeline-tasks";

        /* この時間に該当するタスクを探す */
        selectedTasks.forEach(function(task) {
            /* タスクの実行時間が"HH:MM"形式の文字列なので、最初の2文字で時を判定 */
            if (task.executeTime) {
                /* 実行時間の「時」の部分(例: "13:30" → "13") */
                const taskHour = parseInt(task.executeTime.substring(0, 2), 10);
                /* 現在のループ時間と一致するならこの行に表示 */
                if (taskHour === hour) {
                    const taskBadge = document.createElement("div");
                    taskBadge.className = "timeline-task";
                    /* 時刻付きでタスク名を表示 */
                    taskBadge.textContent = task.executeTime + " " + task.title;
                    tasksArea.appendChild(taskBadge);
                }
            }
        });

        /* 1行に時刻とタスクエリアを追加する */
        timelineRow.appendChild(timeText);
        timelineRow.appendChild(tasksArea);

        /* タイムラインに1行を追加する */
        timelineElement.appendChild(timelineRow);
    }

    /* 実行時間が設定されていないタスクがあれば、最後に「時刻未設定」として一覧表示 */
    /* (実行日はあるが実行時間がないタスクを見落とさないようにするため) */
    const noTimeTasks = selectedTasks.filter(function(task) {
        return !task.executeTime;
    });
    if (noTimeTasks.length > 0) {
        const noTimeRow = document.createElement("div");
        noTimeRow.className = "timeline-row";

        const noTimeLabel = document.createElement("span");
        noTimeLabel.className = "timeline-time";
        noTimeLabel.textContent = "未設定";

        const noTimeArea = document.createElement("div");
        noTimeArea.className = "timeline-tasks";

        noTimeTasks.forEach(function(task) {
            const taskBadge = document.createElement("div");
            /* グレー表示にして時刻ありのタスクと区別する */
            taskBadge.className = "timeline-task no-time";
            taskBadge.textContent = task.title;
            noTimeArea.appendChild(taskBadge);
        });

        noTimeRow.appendChild(noTimeLabel);
        noTimeRow.appendChild(noTimeArea);
        timelineElement.appendChild(noTimeRow);
    }
}


/* ============================================ */
/* 全体の描画                                    */
/* ============================================ */


/* ====== 全部の表示を更新する関数 ====== */
function renderAll() {
    /* タスク一覧を更新 */
    renderTaskList();
    /* カレンダーを更新 */
    renderCalendar();
    /* タイムラインを更新 */
    renderTimeline();
}


/* ============================================ */
/* イベントの設定                                */
/* ============================================ */


/* ====== ページが読み込まれたときに実行する処理 ====== */
/* DOMContentLoadedはHTMLの読み込みが終わった瞬間に発火するイベント */
document.addEventListener("DOMContentLoaded", function() {

    /* localStorageから保存されたタスクを読み込む */
    loadTaskList();

    /* タスク追加ボタンがクリックされたときの処理を登録 */
    document.getElementById("addTaskButton").addEventListener("click", addTask);

    /* カレンダーの前月ボタンがクリックされたときの処理を登録 */
    document.getElementById("prevMonth").addEventListener("click", goToPrevMonth);

    /* カレンダーの次月ボタンがクリックされたときの処理を登録 */
    document.getElementById("nextMonth").addEventListener("click", goToNextMonth);

    /* 「今日に戻す」ボタンがクリックされたときの処理を登録 */
    document.getElementById("backToTodayButton").addEventListener("click", backToToday);

    /* 最初の表示を行う */
    renderAll();
});
