const questions = [
  {
    kicker: "First, a little wish for you.",
    title: "Will you always choose <em>to be happy?</em>",
    description: "You deserve all the little things that make life feel lovely.",
    answer: "Yes, I will",
    symbol: "♡",
  },
  {
    kicker: "And that smile of yours...",
    title: "Will you always <em>keep smiling?</em>",
    description: "The world is a little warmer with your smile in it.",
    answer: "Yes, I will",
    symbol: "☺",
  },
  {
    kicker: "This one's a very important promise.",
    title: "You won't say bad things <em>about yourself, na?</em>",
    description: "Be gentle with yourself. You're someone worth being kind to.",
    answer: "Yes, I promise",
    symbol: "♡",
  },
  {
    kicker: "Okay. One last little question.",
    title: "Will you <em>forget me?</em>",
    description: "There's something I want to tell you on the other side.",
    answer: "Yes",
    symbol: "✧",
  },
];

const pages = [...document.querySelectorAll(".page")];
const arena = document.querySelector("#answer-arena");
const noButton = document.querySelector("#no-button");
const yesButton = document.querySelector("#yes-button");
const note = document.querySelector("#playful-note");
let currentQuestion = 0;
let dodges = 0;
let lastDodge = 0;
let confettiTimer;

function showPage(id) {
  for (const page of pages) page.hidden = page.id !== id;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function resetNoButton() {
  noButton.style.removeProperty("left");
  noButton.style.removeProperty("top");
  dodges = 0;
  lastDodge = 0;
  note.textContent = "Psst... one of these buttons is a little shy.";
}

function renderQuestion() {
  const question = questions[currentQuestion];
  document.querySelector("#question-kicker").textContent = question.kicker;
  document.querySelector("#question-title").innerHTML = question.title;
  document.querySelector("#question-description").textContent = question.description;
  document.querySelector("#question-symbol").textContent = question.symbol;
  yesButton.replaceChildren(document.createTextNode(`${question.answer} `));
  const heart = document.createElement("span");
  heart.textContent = "♡";
  heart.setAttribute("aria-hidden", "true");
  yesButton.append(heart);
  document.querySelector("#step-label").textContent = `0${currentQuestion + 1} / 04`;
  const dots = document.querySelector("#progress-dots");
  dots.replaceChildren();
  questions.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = `progress-dot${index === currentQuestion ? " active" : index < currentQuestion ? " complete" : ""}`;
    dot.setAttribute("aria-hidden", "true");
    dots.append(dot);
  });
  dots.setAttribute("aria-label", `Question ${currentQuestion + 1} of 4`);
  showPage("questions");
  resetNoButton();
  document.querySelector("#question-title").focus({ preventScroll: true });
}

function dodgeNo(event) {
  event.preventDefault();
  const now = performance.now();
  // A touch can fire several events. Move once per gesture.
  if (now - lastDodge < 140) return;
  lastDodge = now;
  const bounds = arena.getBoundingClientRect();
  const button = noButton.getBoundingClientRect();
  const yes = yesButton.getBoundingClientRect();
  const oldX = button.left - bounds.left;
  const oldY = button.top - bounds.top;
  const maxX = Math.max(0, bounds.width - button.width);
  const maxY = Math.max(0, bounds.height - button.height);
  const candidates = [
    { x: 0, y: 0 }, { x: maxX, y: 0 },
    { x: 0, y: maxY }, { x: maxX, y: maxY },
    { x: maxX / 2, y: maxY },
  ];
  // Keep the escaping button inside its playground and clear of "Yes".
  const valid = candidates.filter(({ x, y }) => {
    const left = bounds.left + x;
    const top = bounds.top + y;
    const overlapsYes = left < yes.right + 8 && left + button.width > yes.left - 8
      && top < yes.bottom + 8 && top + button.height > yes.top - 8;
    const underPointer = Number.isFinite(event.clientX)
      && event.clientX >= left - 10 && event.clientX <= left + button.width + 10
      && event.clientY >= top - 10 && event.clientY <= top + button.height + 10;
    return !overlapsYes && !underPointer && Math.hypot(x - oldX, y - oldY) > 75;
  });
  const destination = valid[Math.floor(Math.random() * valid.length)];
  if (!destination) return;
  noButton.style.left = `${destination.x}px`;
  noButton.style.top = `${destination.y}px`;
  dodges += 1;
  const notes = ["Oops! That one's feeling a little shy.", "Catch me if you can ♡", "A tiny button with a lot of energy.", "Still playing hard to get..."];
  note.textContent = notes[(dodges - 1) % notes.length];
}

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const container = document.querySelector("#confetti");
  clearTimeout(confettiTimer);
  container.replaceChildren();
  const colors = ["#d59ba4", "#d9b759", "#94aa80", "#edc8cc", "#b5c8a2"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.setProperty("--drift", `${Math.random() * 160 - 80}px`);
    piece.style.setProperty("--rotation", `${Math.random() * 720 - 360}deg`);
    container.append(piece);
  }
  confettiTimer = setTimeout(() => container.replaceChildren(), 4700);
}

document.querySelector("#open-button").addEventListener("click", () => {
  currentQuestion = 0;
  renderQuestion();
});
yesButton.addEventListener("click", () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
  } else {
    showPage("goodbye");
    document.querySelector("#goodbye-title").focus({ preventScroll: true });
    celebrate();
  }
});
noButton.addEventListener("pointerenter", dodgeNo);
noButton.addEventListener("pointerdown", dodgeNo);
noButton.addEventListener("click", dodgeNo);
document.querySelector("#back-button").addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  } else {
    showPage("welcome");
    document.querySelector("#open-button").focus({ preventScroll: true });
  }
});
document.querySelector("#restart-button").addEventListener("click", () => {
  currentQuestion = 0;
  clearTimeout(confettiTimer);
  document.querySelector("#confetti").replaceChildren();
  showPage("welcome");
  document.querySelector("#open-button").focus({ preventScroll: true });
});
window.addEventListener("resize", () => {
  if (!document.querySelector("#questions").hidden) resetNoButton();
});
