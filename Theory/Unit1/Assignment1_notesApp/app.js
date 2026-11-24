// =========================================================================
// 1. LESSON 07 HELPER PATTERN (Section 7.2)
// =========================================================================

/**
 * Saves complex data (objects/arrays) into localStorage as a JSON string.
 */
function save(key, data) {
  try {
    const jsonString = JSON.stringify(data); // Lesson 07, Section 5
    localStorage.setItem(key, jsonString);   // Lesson 07, Section 2
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

/**
 * Loads and parses JSON data safely from localStorage.
 */
function load(key) {
  const raw = localStorage.getItem(key);     // Lesson 07, Section 2
  if (!raw) return null;

  try {
    return JSON.parse(raw);                 // Lesson 07, Section 6
  } catch (err) {
    console.error("Parse failed for key:", key, err.message); // Lesson 07, Section 6 Error Handling
    return null;
  }
}

// =========================================================================
// 2. APPLICATION INITIALIZATION & STATE
// =========================================================================

const STORAGE_KEY = "my_notes_app_data";

// Load existing notes or fallback to empty array if key returns null
let notes = load(STORAGE_KEY) || [];

// DOM Elements
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const notesGrid = document.getElementById("notes-grid");
const searchInput = document.getElementById("search-input");
const clearAllBtn = document.getElementById("clear-all-btn");

// Render notes on page load
document.addEventListener("DOMContentLoaded", () => {
  renderNotes();
});

// =========================================================================
// 3. EVENT HANDLERS (CRUD & SEARCH)
// =========================================================================

// Create / Add Note
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return;

  const newNote = {
    id: Date.now(),
    title: title,
    content: content,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  notes.push(newNote);
  save(STORAGE_KEY, notes); // Save array using JSON.stringify helper
  renderNotes();

  noteForm.reset();
});

// Delete Single Note
function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  save(STORAGE_KEY, notes); // Save updated array
  renderNotes();
}

// Clear All Notes (Lesson 07, Section 2 - removeItem / clear)
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all notes?")) {
    notes = [];
    localStorage.removeItem(STORAGE_KEY); // Removes specific key
    renderNotes();
  }
});

// Search & Filter
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
  );
  renderNotes(filteredNotes);
});

// =========================================================================
// 4. UI RENDER FUNCTION
// =========================================================================

function renderNotes(notesToDisplay = notes) {
  notesGrid.innerHTML = "";

  if (notesToDisplay.length === 0) {
    notesGrid.innerHTML = `<p class="empty-msg">No notes available.</p>`;
    return;
  }

  notesToDisplay.forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `
      <div class="note-body">
        <h3>${escapeHtml(note.title)}</h3>
        <span class="note-date">${note.date}</span>
        <p>${escapeHtml(note.content)}</p>
      </div>
      <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
    `;
    notesGrid.appendChild(card);
  });
}

// Security: Prevent XSS
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}