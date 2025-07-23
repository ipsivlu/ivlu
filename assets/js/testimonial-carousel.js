const slides = document.querySelectorAll(".testimonial-slide");
const nextBtn = document.querySelector(".carousel-btn.next");
const prevBtn = document.querySelector(".carousel-btn.prev");
let currentSlide = 0;
let autoSlideInterval;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 8000); // 8 segundos
}

nextBtn.addEventListener("click", () => {
  nextSlide();
  resetAutoSlide();
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  resetAutoSlide();
});

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

showSlide(currentSlide);
startAutoSlide();
