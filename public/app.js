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
  "Graffiti removal":
    "Small tags/single panel: $75–$175. Medium wall/storefront: $175–$450. Large or sensitive masonry: custom quote.",
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
  const service = bookingForm.querySelector("#bookingService")?.value?.trim();

  const messageLines = [
    "New booking request:",
    `Name: ${name || "-"}`,
    `WhatsApp: ${whatsapp || "-"}`,
    `Service: ${service || "-"}`,
    `Email: ${email || "-"}`,
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

/** @param {number} rating */
const starLabel = (rating) => {
  const r = Math.min(5, Math.max(1, Number(rating) || 1));
  return `${"★".repeat(r)} (${r}/5)`;
};

/** Migrated “Trusted in Lacey…” quotes — starred for display beside sheet submissions */
const FEATURED_LEGACY_REVIEWS = [
  {
    rating: 5,
    service: "Residential cleaning · Lacey, WA",
    comments: "Professional service and great results. Highly recommend.",
    name: "Carolyne Muchelule",
  },
  {
    rating: 5,
    service: "Deep carpet & upholstery cleaning",
    comments:
      "Victor removed every stain and the odor is gone. Our couch looks new.",
    name: "Katrina",
  },
  {
    rating: 5,
    service: "Commercial carpet cleaning",
    comments: "Office carpet looks clean and smells great. Highly recommended.",
    name: "Maymun Mohamed",
  },
  {
    rating: 5,
    service: "Residential cleaning · Lacey, WA",
    comments: "Very professional, affordable, and reliable.",
    name: "Grace Ann",
  },
  {
    rating: 5,
    service: "Full-day deep cleaning",
    comments:
      "Arrived early, worked six hours straight, and delivered excellent results.",
    name: "Cary Priamos",
  },
];

/**
 * @param {HTMLElement} trackEl
 * @param {{ rating: number; service: string; comments: string; name: string }} rev
 */
const appendClientReviewCard = (trackEl, rev) => {
  const article = document.createElement("article");
  article.className = "review-card";

  const meta = document.createElement("p");
  meta.className = "client-review-meta";
  meta.textContent = `${starLabel(rev.rating)} · ${rev.service}`;

  const body = document.createElement("p");
  const text =
    typeof rev.comments === "string" && rev.comments.trim()
      ? rev.comments.trim()
      : "Thank you for the great work.";
  body.textContent = `\u201c${text}\u201d`;

  const by = document.createElement("span");
  by.textContent = `— ${rev.name.trim()}`;

  article.append(meta, body, by);
  trackEl.appendChild(article);
};

/**
 * @param {HTMLElement} trackEl
 * @param {HTMLElement} dotsEl
 * @returns {() => void}
 */
const attachReviewDotsDisposable = (trackEl, dotsEl) => {
  if (!trackEl || !dotsEl) return () => {};

  const setActiveDot = () => {
    const currentCards = trackEl.querySelectorAll(".review-card");
    if (!currentCards.length) return;
    const trackRect = trackEl.getBoundingClientRect();
    let activeIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    currentCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const distance = Math.abs(cardRect.left - trackRect.left);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });
    dotsEl.querySelectorAll(".reviews-dot").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  };

  const rebuildDots = () => {
    dotsEl.innerHTML = "";
    trackEl.querySelectorAll(".review-card").forEach((card, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-dot";
      dot.setAttribute("aria-label", `Show review ${index + 1}`);
      dot.addEventListener("click", () => {
        card.scrollIntoView({ behavior: "smooth", inline: "start" });
      });
      dotsEl.appendChild(dot);
    });
  };

  const onScroll = () => window.requestAnimationFrame(setActiveDot);
  const onResize = () => setActiveDot();

  rebuildDots();
  setActiveDot();
  trackEl.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onResize);

  return () => {
    trackEl.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  };
};

const reviewForm = document.querySelector(".review-form");
const clientReviewsTrack = document.getElementById("clientReviewsTrack");
const clientReviewsDots = document.getElementById("clientReviewsDots");
const clientReviewsStatus = document.getElementById("clientReviewsStatus");

let disposeClientReviewStrip = () => {};

const finishClientReviewStrip = () => {
  if (!clientReviewsTrack || !clientReviewsDots) return;
  disposeClientReviewStrip();
  disposeClientReviewStrip = () => {};
  const n = clientReviewsTrack.querySelectorAll(".review-card").length;
  if (n <= 1) {
    clientReviewsDots.innerHTML = "";
    clientReviewsDots.hidden = true;
    return;
  }
  clientReviewsDots.hidden = false;
  disposeClientReviewStrip = attachReviewDotsDisposable(
    clientReviewsTrack,
    clientReviewsDots,
  );
};

const renderSubmittedReviewsToStrip = async () => {
  disposeClientReviewStrip();
  disposeClientReviewStrip = () => {};

  if (!clientReviewsTrack || !clientReviewsDots || !clientReviewsStatus) return;

  clientReviewsTrack.innerHTML = "";
  clientReviewsDots.innerHTML = "";
  clientReviewsDots.hidden = true;
  clientReviewsStatus.textContent = "";

  FEATURED_LEGACY_REVIEWS.forEach((rev) =>
    appendClientReviewCard(clientReviewsTrack, rev),
  );

  try {
    const res = await fetch("/api/reviews", { credentials: "same-origin" });
    const data = await res.json();

    if (data.configured === false && data.ok !== false) {
      finishClientReviewStrip();
      return;
    }

    if (!data.ok || !Array.isArray(data.reviews)) {
      clientReviewsStatus.textContent =
        data.error ||
        "Could not load submitted reviews — try refreshing in a minute.";
      finishClientReviewStrip();
      return;
    }

    const list = /** @type {Array<{rating:number,name?:string,service?:string,comments?:string}>} */ (
      data.reviews
    );

    for (const rev of list) {
      appendClientReviewCard(clientReviewsTrack, {
        rating: rev.rating,
        service: (rev.service && String(rev.service).trim()) || "Service noted at booking",
        comments: (rev.comments && String(rev.comments).trim()) || "",
        name: (rev.name && String(rev.name).trim()) || "Happy customer",
      });
    }

    if (data.configured === true && list.length === 0) {
      clientReviewsStatus.textContent =
        "Submit your visit below — new reviews appear here after approval.";
    }

    finishClientReviewStrip();
  } catch (_err) {
    clientReviewsStatus.textContent =
      "Could not load reviews. Use “npm start” locally or deploy the Node server.";
    finishClientReviewStrip();
  }
};

void renderSubmittedReviewsToStrip();

reviewForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!reviewForm.checkValidity()) {
    reviewForm.reportValidity();
    return;
  }

  const submitButton = reviewForm.querySelector('button[type="submit"]');
  const ratingRaw = reviewForm.querySelector("#reviewRating")?.value;
  const rating = Number.parseInt(ratingRaw, 10);
  const service = reviewForm.querySelector("#reviewService")?.value?.trim();
  const customerName = reviewForm.querySelector("#reviewName")?.value?.trim();
  const comments = reviewForm.querySelector("#reviewComment")?.value?.trim();

  if (!submitButton) return;

  const origLabel = submitButton.textContent;
  submitButton.textContent = "Sending…";
  submitButton.disabled = true;

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        rating,
        service,
        name: customerName || "",
        comments: comments || "",
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      submitButton.textContent = origLabel || "Submit review";
      submitButton.disabled = false;
      const msg =
        data.error ||
        "Could not save your review. Try again or call us if this keeps happening.";
      window.alert(msg);
      return;
    }

    reviewForm.reset();
    submitButton.textContent = origLabel || "Submit review";
    submitButton.disabled = false;
    window.alert(
      "Thanks — we received your review. After it is approved, it will appear on the home page under “What our clients say.”"
    );
    if (document.getElementById("clientReviewsTrack")) {
      await renderSubmittedReviewsToStrip();
    }
  } catch (_err) {
    submitButton.textContent = origLabel || "Submit review";
    submitButton.disabled = false;
    window.alert("Network error — check your connection and try again.");
  }
});
