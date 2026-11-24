// public/js/app.js
// Client-side interactions for My Notes application

document.addEventListener('DOMContentLoaded', () => {
  // Confirm delete on all delete forms
  const deleteForms = document.querySelectorAll('.delete-form');
  deleteForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      const noteTitle = form.getAttribute('data-title') || 'this note';
      const confirmed = window.confirm(`Are you sure you want to delete "${noteTitle}"? This cannot be undone.`);
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });

  // Auto-dismiss success alert after 4 seconds
  const successAlert = document.querySelector('.alert-success');
  if (successAlert) {
    setTimeout(() => {
      successAlert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      successAlert.style.opacity = '0';
      successAlert.style.transform = 'translateY(-10px)';
      setTimeout(() => successAlert.remove(), 500);
    }, 4000);
  }
});
