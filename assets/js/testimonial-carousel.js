document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelectorAll(".testimonial");
  const prevBtn = document.getElementById("prev-testimonial");
  const nextBtn = document.getElementById("next-testimonial");
  let index = 0;
  let interval;

  const showTestimonial = (i) => {
    testimonials.forEach((t, idx) => {
      t.classList.remove("active");
      if (idx === i) {
        t.classList.add("active");
      }
    });
  };

  const nextTestimonial = () => {
    index = (index + 1) % testimonials.length;
    showTestimonial(index);
  };

  const prevTestimonial = () => {
    index = (index - 1 + testimonials.length) % testimonials.length;
    showTestimonial(index);
  };

  const startAutoCycle = () => {
    interval = setInterval(nextTestimonial, 7000); // 7 segundos
  };

  const resetCycle = () => {
    clearInterval(interval);
    startAutoCycle();
  };

  nextBtn.addEventListener("click", () => {
    nextTestimonial();
    resetCycle();
  });

  prevBtn.addEventListener("click", () => {
    prevTestimonial();
    resetCycle();
  });

  showTestimonial(index);
  startAutoCycle();
});
