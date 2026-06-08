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

const showcase = document.querySelector(".car-showcase");
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
let targetProgress = 0;
let currentProgress = 0;
let animationFrame = null;
let startX = 0;
let currentX = 0;
let isDragging = false;
let pointerId = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

function updateCopy(index) {
  const slide = slides[index];

  modelWord.classList.add("is-changing");

  window.setTimeout(() => {
    modelWord.textContent = slide.model;
    eyebrow.textContent = slide.eyebrow;
    title.textContent = slide.model;
    description.textContent = slide.description;
    button.href = slide.link;
    currentCount.textContent = padNumber(index + 1);
    modelWord.classList.remove("is-changing");
  }, 110);
}

function updateDots(index) {
  dots.querySelectorAll("[data-dot]").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
  });
}

function setActiveIndex(index) {
  const nextIndex = clamp(index, 0, slides.length - 1);

  if (nextIndex === activeIndex) {
    updateDots(nextIndex);
    return;
  }

  activeIndex = nextIndex;
  updateCopy(activeIndex);
  updateDots(activeIndex);
}

function applyProgress(progress) {
  const exactIndex = progress;
  const nearestIndex = clamp(Math.round(exactIndex), 0, slides.length - 1);
  const slideElements = track.querySelectorAll("[data-slide]");
  const viewportWidth = window.innerWidth;
  const spacing = clamp(viewportWidth * (viewportWidth < 700 ? 1.08 : 0.72), 430, 1180);

  slideElements.forEach((slide, index) => {
    const delta = index - exactIndex;
    const distance = Math.abs(delta);
    const x = delta * spacing;
    const opacity = viewportWidth < 700
      ? clamp(1 - Math.max(0, distance - 0.82) * 1.35, 0, 1)
      : clamp(1 - Math.max(0, distance - 1.25) * 0.85, 0, 1);
    const scale = 1 - Math.min(distance, 1.5) * 0.02;
    const mediaScale = 1 - Math.min(distance, 1.2) * 0.012;

    slide.style.setProperty("--slide-x", `${x.toFixed(2)}px`);
    slide.style.setProperty("--slide-depth", distance.toFixed(4));
    slide.style.setProperty("--slide-opacity", opacity.toFixed(4));
    slide.style.setProperty("--slide-scale", scale.toFixed(4));
    slide.style.setProperty("--media-scale", mediaScale.toFixed(4));
    slide.style.zIndex = String(30 - Math.round(distance * 6));
    slide.classList.toggle("is-active", index === nearestIndex);
    slide.classList.toggle("is-prev", index < nearestIndex);
    slide.classList.toggle("is-next", index > nearestIndex);
  });

  setActiveIndex(nearestIndex);
}

function animateProgress() {
  const distance = targetProgress - currentProgress;
  const easing = window.innerWidth < 700 ? 0.055 : 0.038;
  currentProgress += distance * easing;

  if (Math.abs(distance) < 0.001) {
    currentProgress = targetProgress;
  }

  applyProgress(currentProgress);

  if (currentProgress !== targetProgress) {
    animationFrame = window.requestAnimationFrame(animateProgress);
    return;
  }

  animationFrame = null;
}

function requestProgressAnimation() {
  if (animationFrame) {
    return;
  }

  animationFrame = window.requestAnimationFrame(animateProgress);
}

function moveProgress(delta) {
  targetProgress = clamp(targetProgress + delta, 0, slides.length - 1);
  requestProgressAnimation();
}

function goToSlide(index) {
  targetProgress = clamp(index, 0, slides.length - 1);
  requestProgressAnimation();
}

function handleWheel(event) {
  event.preventDefault();

  const normalizedDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY;

  const wheelDivisor = window.innerWidth < 700 ? 1180 : 1750;
  moveProgress(normalizedDelta / wheelDivisor);
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
  const limitedDistance = clamp(dragDistance, -120, 120);

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
    moveProgress(dragDistance < 0 ? 0.74 : -0.74);
  }
}

renderSlides();
showcase.classList.add("is-wheel-driven");
applyProgress(0);

showcase.addEventListener("wheel", handleWheel, { passive: false });
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

window.addEventListener("resize", () => applyProgress(currentProgress));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    goToSlide(activeIndex - 1);
  }

  if (event.key === "ArrowRight") {
    goToSlide(activeIndex + 1);
  }
});
