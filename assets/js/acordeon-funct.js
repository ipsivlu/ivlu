document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.ivlu-accordion-header');
  items.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      parent.classList.toggle('active');
    });
  });
});
