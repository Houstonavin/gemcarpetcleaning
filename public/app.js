const estimateButton = document.querySelector(".estimate-form button");
const estimateResult = document.getElementById("estimateResult");
const bookingForm = document.querySelector(".booking-form");
const dateInput = bookingForm?.querySelector('input[type="date"]');

const estimateMap = {
  "1–2 rooms": 129,
  "3–4 rooms": 219,
  "5+ rooms": 349,
};

const servicePricing = {
  "Deep carpet & upholstery cleaning":
    "Carpet: $55 / room (2‑room minimum). Hallways/stairs: $35–$55. Upholstery: $75–$195.",
  "Driveway pressure washing":
    "Standard driveway: $120–$220. Large/long: $250–$400.",
  "Sidewalk scrubbing & cleaning":
    "Residential walkway: $45–$95. Full front: $95–$150.",
  "Kitchen hood & floor degreasing":
    "Hood degreasing: $150–$250. Commercial floor: $0.45–$0.75 / sq. ft. Residential floor: $85–$150.",
  "Tile scrubbing & polishing":
    "Tile & grout: $0.60–$1.00 / sq. ft. Polish/seal: +$0.25–$0.45 / sq. ft.",
  "Area rug refreshing":
    "Small: $35–$65. Medium: $75–$120. Large: $135–$195.",
  "Stain & odor removal":
    "Spot: $15–$35 per spot. Pet odor: $35–$65 per room. Severe odor: $75–$125 per room.",
  "Commercial cleaning":
    "Carpet: $0.20–$0.35 / sq. ft. Tile/hard floor: $0.35–$0.55 / sq. ft. Recurring: custom quote.",
  "Allergen reduction": "HEPA + neutralizer: $25–$45 / room. Whole‑home: $95–$175.",
  "Protective treatments":
    "Carpet protector: $25–$45 / room. Upholstery: $15–$35 / seat.",
  "Fast‑dry technology": "Add‑on: $15–$25 / room. Whole‑home: $45–$75.",
  "Move‑out cleaning":
    "Carpet only (up to 3 beds): $150–$250. Full home: $250–$450. Add odor: +$45–$95.",
};

if (dateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

estimateButton?.addEventListener("click", () => {
  const estimateForm = estimateButton.closest(".estimate-form");
  const roomValue =
    estimateForm?.querySelector("#estimateRooms")?.value || "1–2 rooms";
  const serviceValue = estimateForm?.querySelector("#estimateService")?.value || "";
  estimateResult.textContent = "Calculating estimate...";

  if (servicePricing[serviceValue]) {
    estimateResult.textContent = `Estimated pricing: ${servicePricing[serviceValue]}`;
    return;
  }

  const price = estimateMap[roomValue] || 129;
  estimateResult.textContent = `Estimated starting price: $${price}`;
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const name = bookingForm.querySelector("#bookingName")?.value?.trim();
  const email = bookingForm.querySelector("#bookingEmail")?.value?.trim();
  const whatsapp = bookingForm.querySelector("#bookingWhatsapp")?.value?.trim();
  const address = bookingForm.querySelector("#bookingAddress")?.value?.trim();
  const date = bookingForm.querySelector("#bookingDate")?.value?.trim();
  const time = bookingForm.querySelector("#bookingTime")?.value?.trim();

  const messageLines = [
    "New booking request:",
    `Name: ${name || "-"}`,
    `WhatsApp: ${whatsapp || "-"}`,
    `Email: ${email || "-"}`,
    `Address: ${address || "-"}`,
    `Preferred date: ${date || "-"}`,
    `Preferred time: ${time || "-"}`,
  ];

  const message = encodeURIComponent(messageLines.join("\n"));
  const whatsappUrl = `https://wa.me/17733296506?text=${message}`;

  submitButton.textContent = "Opening WhatsApp...";
  submitButton.disabled = true;
  window.location.href = whatsappUrl;
});

const resultsTrack = document.querySelector(".results-track");
const resultsDots = document.querySelector(".results-dots");
const resultCards = resultsTrack?.querySelectorAll(".results-card") || [];
const reviewsTrack = document.querySelector(".reviews-track");
const reviewsDots = document.querySelector(".reviews-dots");
const reviewCards = reviewsTrack?.querySelectorAll(".review-card") || [];

const requiredFields = document.querySelectorAll(".required-field");

const toggleFieldMessage = (field, show) => {
  const message = field.closest("label")?.querySelector(".field-message");
  if (!message) return;
  message.classList.toggle("show", show);
};

const updateFieldState = (field) => {
  const isValid = field.checkValidity();
  field.classList.toggle("invalid", !isValid);
  toggleFieldMessage(field, !isValid);
};

requiredFields.forEach((field) => {
  field.addEventListener("focus", () => {
    if (!field.value) {
      toggleFieldMessage(field, true);
    }
  });
  field.addEventListener("input", () => updateFieldState(field));
  field.addEventListener("blur", () => updateFieldState(field));
});

const buildResultsDots = () => {
  if (!resultsDots || !resultCards.length) return;
  resultsDots.innerHTML = "";
  resultCards.forEach((_card, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "results-dot";
    dot.setAttribute("aria-label", `Show result ${index + 1}`);
    dot.addEventListener("click", () => {
      resultCards[index].scrollIntoView({ behavior: "smooth", inline: "start" });
    });
    resultsDots.appendChild(dot);
  });
};

const setActiveDot = () => {
  if (!resultsDots || !resultsTrack || !resultCards.length) return;
  const trackRect = resultsTrack.getBoundingClientRect();
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  resultCards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const distance = Math.abs(cardRect.left - trackRect.left);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });
  resultsDots.querySelectorAll(".results-dot").forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
};

if (resultCards.length) {
  buildResultsDots();
  setActiveDot();
  resultsTrack?.addEventListener("scroll", () => {
    window.requestAnimationFrame(setActiveDot);
  });
  window.addEventListener("resize", setActiveDot);
}

const buildReviewDots = () => {
  if (!reviewsDots || !reviewCards.length) return;
  reviewsDots.innerHTML = "";
  reviewCards.forEach((_card, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "reviews-dot";
    dot.setAttribute("aria-label", `Show review ${index + 1}`);
    dot.addEventListener("click", () => {
      reviewCards[index].scrollIntoView({ behavior: "smooth", inline: "start" });
    });
    reviewsDots.appendChild(dot);
  });
};

const setActiveReviewDot = () => {
  if (!reviewsDots || !reviewsTrack || !reviewCards.length) return;
  const trackRect = reviewsTrack.getBoundingClientRect();
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  reviewCards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const distance = Math.abs(cardRect.left - trackRect.left);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });
  reviewsDots.querySelectorAll(".reviews-dot").forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
};

if (reviewCards.length) {
  buildReviewDots();
  setActiveReviewDot();
  reviewsTrack?.addEventListener("scroll", () => {
    window.requestAnimationFrame(setActiveReviewDot);
  });
  window.addEventListener("resize", setActiveReviewDot);
}

const revealElements = document.querySelectorAll(".reveal-on-scroll");
if (revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.4 }
  );

  revealElements.forEach((el) => observer.observe(el));
}
