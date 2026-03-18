// Keyboard accessibility handler
document.addEventListener('DOMContentLoaded', function() {
  // Handle Enter/Space on tabbable elements with onclick
  document.querySelectorAll('[tabindex]:not(input, button, textarea), [tabindex] .close, .avatar-preview, .upload-preview').forEach(el => {
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onclick) {
          this.onclick();
        } else if (this.querySelector('input[type=file]')) {
          this.querySelector('input[type=file]').click();
        } else if (this.onclickStr) {
          eval(this.onclickStr);
        }
      }
    });
  });

  // Toggle buttons already buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.setAttribute('tabindex', '0');
  });

  // Dynamic elements (posts, profile headers)
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.post-user, .close[onclick]').forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this.onclick) this.onclick();
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
