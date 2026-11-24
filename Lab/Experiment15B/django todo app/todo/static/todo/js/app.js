// Run this function after the HTML document has been parsed.
document.addEventListener("DOMContentLoaded", function () {
    // Select the task-title input, if the current page contains it.
    const titleInput = document.querySelector("#title");

    // Focus the input on the Add Task page to speed up data entry.
    if (titleInput) {
        titleInput.focus();
    }

    // Log a simple message for students to verify that the file loaded.
    console.log("Task Tracker JavaScript loaded.");
});
