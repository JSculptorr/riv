const slides = [
  {
    model: "R1S",
    eyebrow: "Adventure SUV",
    image: "assets/r1s.png",
    fallback: "assets/r1s.png",
    localFallback: "assets/car-1.png",
    description:
      "Three-row electric SUV with clean proportions, quiet power and long-route confidence.",
    link: "https://rivian.com/r1s"
  },
  {
    model: "R1T",
    eyebrow: "Electric pickup",
    image: "assets/r1t.png",
    fallback: "assets/r1t.png",
    localFallback: "assets/car-2.png",
    description:
      "Electric pickup built for gear, distance and a more polished kind of utility.",
    link: "https://rivian.com/r1t"
  },
  {
    model: "VAN",
    eyebrow: "Commercial van",
    image: "assets/van.png",
    fallback: "assets/van.png",
    localFallback: "assets/car-3.png",
    description:
      "Electric delivery platform with a tall stance, practical volume and a clean fleet presence.",
    link: "https://rivian.com/fleet"
  }
];

const slider = document.querySelector("[data-slider]");
const track = document.querySelector("[data-track]");
const dots = document.querySelector("[data-dots]");
const modelWord = document.querySelector("[data-model-word]");
const currentCount = document.querySelector("[data-current]");
const totalCount = document.querySelector("[data-total]");
const eyebrow = document.querySelector("[data-eyebrow]");
const title = document.querySelector("[data-title]");
const description = document.querySelector("[data-description]");
const button = document.querySelector("[data-button]");
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");

let activeIndex = 0;
let previousIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;
let pointerId = null;

function padNumber(number) {
  return String(number).padStart(2, "0");
}

function renderSlides() {
  totalCount.textContent = padNumber(slides.length);

  track.innerHTML = slides
    .map(
      (slide, index) => `
        <article class="car-slide" aria-label="${slide.model}" data-slide="${index}">
          <div class="car-media car-media-${slide.model.toLowerCase()}">
            <span class="car-reflection" aria-hidden="true"></span>
            <img
              class="car-image"
              src="${slide.image}"
              data-fallback="${slide.fallback}"
              data-local-fallback="${slide.localFallback}"
              alt="${slide.model}"
              draggable="false"
            >
          </div>
        </article>
      `
    )
    .join("");

  dots.innerHTML = slides
    .map(
      (slide, index) => `
        <button class="dot-button" type="button" data-dot="${index}" aria-label="Show ${slide.model}"></button>
      `
    )
    .join("");

  track.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener("error", () => {
      if (!image.dataset.usedFallback) {
        image.dataset.usedFallback = "true";
        image.src = image.dataset.fallback;
        return;
      }

      image.src = image.dataset.localFallback;
    });
  });
}

function getRelativeState(index) {
  if (index === activeIndex) {
    return "active";
  }

  if (index === previousIndex) {
    return activeIndex > previousIndex ? "prev" : "next";
  }

  return index < activeIndex ? "prev" : "next";
}

function updateSlideClasses() {
  const slideElements = track.querySelectorAll("[data-slide]");
  const dotElements = dots.querySelectorAll("[data-dot]");

  slideElements.forEach((slide, index) => {
    const state = getRelativeState(index);

    slide.classList.toggle("is-active", state === "active");
    slide.classList.toggle("is-prev", state === "prev");
    slide.classList.toggle("is-next", state === "next");
  });

  dotElements.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
    dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
  });
}

function updateCopy() {
  const slide = slides[activeIndex];

  modelWord.classList.add("is-changing");
  document.documentElement.style.setProperty("--accent-shift", activeIndex);

  window.setTimeout(() => {
    modelWord.textContent = slide.model;
    eyebrow.textContent = slide.eyebrow;
    title.textContent = slide.model;
    description.textContent = slide.description;
    button.href = slide.link;
    currentCount.textContent = padNumber(activeIndex + 1);
    modelWord.classList.remove("is-changing");
  }, 160);
}

function goToSlide(index) {
  const nextIndex = (index + slides.length) % slides.length;

  if (nextIndex === activeIndex) {
    return;
  }

  previousIndex = activeIndex;
  activeIndex = nextIndex;
  track.style.setProperty("--drag-offset", "0px");
  updateSlideClasses();
  updateCopy();
}

function handlePointerDown(event) {
  isDragging = true;
  pointerId = event.pointerId;
  startX = event.clientX;
  currentX = event.clientX;
  slider.classList.add("is-dragging");
  slider.setPointerCapture(pointerId);
}

function handlePointerMove(event) {
  if (!isDragging || event.pointerId !== pointerId) {
    return;
  }

  currentX = event.clientX;
  const dragDistance = currentX - startX;
  const limitedDistance = Math.max(Math.min(dragDistance, 120), -120);

  track.style.setProperty("--drag-offset", `${limitedDistance}px`);
}

function finishDrag(event) {
  if (!isDragging || event.pointerId !== pointerId) {
    return;
  }

  const dragDistance = currentX - startX;
  isDragging = false;
  slider.classList.remove("is-dragging");
  track.style.setProperty("--drag-offset", "0px");

  if (Math.abs(dragDistance) > 54) {
    goToSlide(activeIndex + (dragDistance < 0 ? 1 : -1));
  }
}

renderSlides();
updateSlideClasses();
updateCopy();

prevButton.addEventListener("click", () => goToSlide(activeIndex - 1));
nextButton.addEventListener("click", () => goToSlide(activeIndex + 1));

dots.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-dot]");

  if (!dot) {
    return;
  }

  goToSlide(Number(dot.dataset.dot));
});

slider.addEventListener("pointerdown", handlePointerDown);
slider.addEventListener("pointermove", handlePointerMove);
slider.addEventListener("pointerup", finishDrag);
slider.addEventListener("pointercancel", finishDrag);
slider.addEventListener("lostpointercapture", () => {
  if (!isDragging) {
    return;
  }

  isDragging = false;
  slider.classList.remove("is-dragging");
  track.style.setProperty("--drag-offset", "0px");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    goToSlide(activeIndex - 1);
  }

  if (event.key === "ArrowRight") {
    goToSlide(activeIndex + 1);
  }
});
