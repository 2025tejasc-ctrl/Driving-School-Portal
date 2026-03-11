document.addEventListener("DOMContentLoaded", () => {
  initNavbarToggle();
  initRevealAnimation();
  initPricingRedirect();
  initBookPageSelection();
  initBookingForm();
  initProgressPage();
  initPreloader();
  initCursorGlow();
  initCounters();
  initCardShine();
  initContactForm();
  initFaqAccordion();
  initSlotAvailability();
});

function initNavbarToggle() {
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (!navToggle || !primaryNav) return;

  navToggle.addEventListener("click", () => {
    primaryNav.classList.toggle("show");
    navToggle.classList.toggle("open");
  });
}

function initRevealAnimation() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: 0.12 },
  );

  reveals.forEach((item) => observer.observe(item));
}

function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  window.addEventListener("load", () => {
    preloader.classList.add("hide");
    setTimeout(() => preloader.remove(), 700);
  });
}

function initCursorGlow() {
  const cursorGlow = document.getElementById("cursorGlow");
  if (!cursorGlow || window.innerWidth < 768) return;

  window.addEventListener("mousemove", (e) => {
    cursorGlow.style.transform = `translate(${e.clientX - 90}px, ${e.clientY - 90}px)`;
  });
}

function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const isDecimal = el.dataset.decimal === "true";
        let current = 0;

        const duration = 1600;
        const stepTime = 20;
        const increment = Math.max(target / (duration / stepTime), 1);

        const timer = setInterval(() => {
          current += increment;

          if (current >= target) {
            current = target;
            clearInterval(timer);
          }

          if (isDecimal) {
            el.textContent = (current / 10).toFixed(1);
          } else {
            el.textContent = Math.floor(current).toLocaleString() + "+";
          }
        }, stepTime);

        obs.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initCardShine() {
  const cards = document.querySelectorAll(".glass-card, .stat-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });
  });
}

function initPricingRedirect() {
  const pricingButtons = document.querySelectorAll(".pricing-btn");
  if (!pricingButtons.length) return;

  pricingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".pricing-card");
      if (!card) return;

      const selectedPlan = card.dataset.plan;
      if (selectedPlan) {
        localStorage.setItem("selectedPlan", selectedPlan);
      }

      window.location.href = "book.html";
    });
  });
}

function initBookPageSelection() {
  const bookingForm = document.getElementById("bookingForm");
  if (!bookingForm) return;

  const packageOptions = document.querySelectorAll(".package-option");
  const packageRadios = document.querySelectorAll('input[name="package"]');

  function clearActivePackages() {
    packageOptions.forEach((option) => option.classList.remove("active"));
  }

  function setActivePackage(radio) {
    clearActivePackages();
    const option = radio.closest(".package-option");
    if (option) option.classList.add("active");
  }

  packageRadios.forEach((radio) => {
    radio.addEventListener("change", () => setActivePackage(radio));
  });

  const savedPlan = localStorage.getItem("selectedPlan");
  if (savedPlan) {
    const targetRadio = document.querySelector(
      `input[name="package"][value="${savedPlan}"]`,
    );

    if (targetRadio) {
      targetRadio.checked = true;
      setActivePackage(targetRadio);
    }

    localStorage.removeItem("selectedPlan");
  }
}

function initBookingForm() {
  const bookingForm = document.getElementById("bookingForm");
  if (!bookingForm) return;

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = document.getElementById("date")?.value || "";
    const time = document.getElementById("time")?.value || "";
    const vehicle = document.getElementById("vehicle")?.value || "";
    const selectedPackage = document.querySelector(
      'input[name="package"]:checked',
    );
    const submitBtn = bookingForm.querySelector('button[type="submit"]');

    if (!date || !time || !vehicle || !selectedPackage) {
      showPopup(
        "Please fill all fields before confirming your booking.",
        "error",
        "Oops!",
      );
      return;
    }

    const originalText = submitBtn ? submitBtn.textContent : "Confirm Booking";

    if (submitBtn) {
      submitBtn.textContent = "Confirming...";
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      try {
        const packageValue = selectedPackage.value;

        const packageLabelMap = {
          single: "Single Lesson",
          five: "5-Lesson Pack",
          ten: "10-Lesson Bundle",
        };

        const packagePriceMap = {
          single: 1200,
          five: 5400,
          ten: 9800,
        };

        const lessonCountMap = {
          single: 1,
          five: 5,
          ten: 10,
        };

        const booking = {
          id: Date.now(),
          date,
          time,
          vehicle,
          package: packageValue,
          packageName: packageLabelMap[packageValue] || "Lesson Package",
          price: packagePriceMap[packageValue] || 0,
          lessons: lessonCountMap[packageValue] || 0,
          bookedAt: new Date().toLocaleString(),
        };

        localStorage.setItem("latestBooking", JSON.stringify(booking));

        const history =
          JSON.parse(localStorage.getItem("bookingHistory")) || [];
        history.push(booking);
        localStorage.setItem("bookingHistory", JSON.stringify(history));

        const progressData = JSON.parse(
          localStorage.getItem("progressData"),
        ) || {
          totalLessonsBooked: 0,
          completedLessons: 0,
          remainingLessons: 0,
        };

        progressData.totalLessonsBooked += booking.lessons;
        progressData.remainingLessons =
          progressData.totalLessonsBooked - progressData.completedLessons;

        localStorage.setItem("progressData", JSON.stringify(progressData));

        showPopup(
          `Booking confirmed for ${booking.packageName} on ${booking.date} at ${booking.time}.`,
          "success",
          "Booking Successful",
        );

        bookingForm.reset();
        document.querySelectorAll(".package-option").forEach((option) => {
          option.classList.remove("active");
        });
      } catch (error) {
        console.error("Booking form error:", error);
        showPopup(
          "Something went wrong while saving your booking.",
          "error",
          "Error",
        );
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    }, 900);
  });
}

function initProgressPage() {
  const totalLessonsEl = document.getElementById("totalLessons");
  const completedLessonsEl = document.getElementById("completedLessons");
  const remainingLessonsEl = document.getElementById("remainingLessons");
  const progressBar = document.getElementById("progressBar");
  const readinessPercent = document.getElementById("readinessPercent");
  const latestBookingBox = document.getElementById("latestBooking");
  const bookingHistoryList = document.getElementById("bookingHistoryList");
  const completeLessonBtn = document.getElementById("completeLessonBtn");
  const resetProgressBtn = document.getElementById("resetProgressBtn");

  const isProgressPage =
    totalLessonsEl ||
    completedLessonsEl ||
    remainingLessonsEl ||
    progressBar ||
    readinessPercent ||
    latestBookingBox ||
    bookingHistoryList ||
    completeLessonBtn ||
    resetProgressBtn;

  if (!isProgressPage) return;

  function getProgressData() {
    return (
      JSON.parse(localStorage.getItem("progressData")) || {
        totalLessonsBooked: 0,
        completedLessons: 0,
        remainingLessons: 0,
      }
    );
  }

  function saveProgressData(data) {
    localStorage.setItem("progressData", JSON.stringify(data));
  }

  function renderProgress() {
    const progressData = getProgressData();
    const latestBooking = JSON.parse(localStorage.getItem("latestBooking"));
    const bookingHistory =
      JSON.parse(localStorage.getItem("bookingHistory")) || [];

    if (totalLessonsEl)
      totalLessonsEl.textContent = progressData.totalLessonsBooked;
    if (completedLessonsEl)
      completedLessonsEl.textContent = progressData.completedLessons;
    if (remainingLessonsEl)
      remainingLessonsEl.textContent = progressData.remainingLessons;

    const readiness = Math.min(
      progressData.totalLessonsBooked > 0
        ? Math.round(
            (progressData.completedLessons / progressData.totalLessonsBooked) *
              100,
          )
        : 0,
      100,
    );

    if (progressBar) {
      progressBar.style.width = `${readiness}%`;
    }

    if (readinessPercent) {
      readinessPercent.textContent = `${readiness}%`;
    }

    if (latestBookingBox) {
      if (latestBooking) {
        latestBookingBox.innerHTML = `
          <div class="booking-item">
            <h4>${latestBooking.packageName}</h4>
            <p><strong>Date:</strong> ${latestBooking.date}</p>
            <p><strong>Time:</strong> ${latestBooking.time}</p>
            <p><strong>Vehicle:</strong> ${latestBooking.vehicle}</p>
            <p><strong>Price:</strong> ₹${latestBooking.price}</p>
          </div>
        `;
      } else {
        latestBookingBox.innerHTML = `<p>No booking found yet.</p>`;
      }
    }

    if (bookingHistoryList) {
      if (bookingHistory.length) {
        bookingHistoryList.innerHTML = bookingHistory
          .slice()
          .reverse()
          .map(
            (booking) => `
              <div class="booking-item">
                <h4>${booking.packageName}</h4>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
                <p><strong>Price:</strong> ₹${booking.price}</p>
              </div>
            `,
          )
          .join("");
      } else {
        bookingHistoryList.innerHTML = `<p>No booking history yet.</p>`;
      }
    }

    if (completeLessonBtn) {
      completeLessonBtn.disabled = progressData.remainingLessons <= 0;
      completeLessonBtn.textContent =
        progressData.remainingLessons <= 0
          ? "All Lessons Completed"
          : "Mark 1 Lesson Complete";
    }
  }

  if (completeLessonBtn) {
    completeLessonBtn.addEventListener("click", () => {
      const progressData = getProgressData();

      if (progressData.remainingLessons > 0) {
        progressData.completedLessons += 1;
        progressData.remainingLessons =
          progressData.totalLessonsBooked - progressData.completedLessons;

        saveProgressData(progressData);
        renderProgress();
        showPopup(
          "One lesson marked as completed.",
          "success",
          "Progress Updated",
        );
      }
    });
  }

  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      localStorage.setItem(
        "progressData",
        JSON.stringify({
          totalLessonsBooked: 0,
          completedLessons: 0,
          remainingLessons: 0,
        }),
      );
      localStorage.removeItem("latestBooking");
      localStorage.removeItem("bookingHistory");

      renderProgress();
      showPopup("Progress has been reset.", "success", "Progress Reset");
    });
  }

  renderProgress();
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const topic = document.getElementById("topic")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      showPopup("Please fill all required fields.", "error", "Oops!");
      return;
    }

    if (!emailPattern.test(email)) {
      showPopup(
        "Please enter a valid email address.",
        "error",
        "Invalid Email",
      );
      return;
    }

    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      const messages =
        JSON.parse(localStorage.getItem("contactMessages")) || [];

      messages.push({
        name,
        email,
        phone,
        topic,
        message,
        createdAt: new Date().toLocaleString(),
      });

      localStorage.setItem("contactMessages", JSON.stringify(messages));

      showPopup(
        "Thank you for reaching out. Our team will get back to you shortly.",
        "success",
        "Message Sent Successfully",
      );

      form.reset();

      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }, 1000);
  });
}
function showPopup(message, type = "success", title = "") {
  const existingPopup = document.querySelector(".booking-popup");
  if (existingPopup) existingPopup.remove();

  const popupTitle = title || (type === "success" ? "Success" : "Oops!");

  const popup = document.createElement("div");
  popup.className = `booking-popup ${type}`;

  popup.innerHTML = `
    <div class="booking-popup-content">
      <div class="booking-popup-icon">${type === "success" ? "✓" : "!"}</div>
      <div class="booking-popup-text">
        <h4>${popupTitle}</h4>
        <p>${message}</p>
      </div>
      <button class="booking-popup-close" aria-label="Close">&times;</button>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = popup.querySelector(".booking-popup-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => popup.remove());
  }

  requestAnimationFrame(() => {
    popup.classList.add("show");
  });

  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      if (popup.parentNode) popup.remove();
    }, 300);
  }, 3500);
}
window.addEventListener("scroll", () => {
  const winScroll =
    document.documentElement.scrollTop || document.body.scrollTop;

  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrolled = (winScroll / height) * 100;

  const bar = document.getElementById("scrollBar");
  if (bar) bar.style.width = scrolled + "%";
});
function initSlotAvailability() {
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const slotGrid = document.getElementById("slotGrid");
  const slotDayLabel = document.getElementById("slotDayLabel");

  if (!dateInput || !timeSelect || !slotGrid || !slotDayLabel) return;

  const slotButtons = () => Array.from(slotGrid.querySelectorAll(".slot-chip"));

  function getSlotStatusList(dateValue) {
    if (!dateValue) {
      return [
        { slot: "07:00 – 08:00", status: "available" },
        { slot: "09:00 – 10:00", status: "available" },
        { slot: "11:00 – 12:00", status: "fast" },
        { slot: "16:00 – 17:00", status: "full" },
        { slot: "18:00 – 19:00", status: "available" }
      ];
    }

    const day = new Date(dateValue).getDate();

    const patterns = [
      [
        { slot: "07:00 – 08:00", status: "available" },
        { slot: "09:00 – 10:00", status: "fast" },
        { slot: "11:00 – 12:00", status: "available" },
        { slot: "16:00 – 17:00", status: "full" },
        { slot: "18:00 – 19:00", status: "available" }
      ],
      [
        { slot: "07:00 – 08:00", status: "full" },
        { slot: "09:00 – 10:00", status: "available" },
        { slot: "11:00 – 12:00", status: "fast" },
        { slot: "16:00 – 17:00", status: "available" },
        { slot: "18:00 – 19:00", status: "available" }
      ],
      [
        { slot: "07:00 – 08:00", status: "available" },
        { slot: "09:00 – 10:00", status: "available" },
        { slot: "11:00 – 12:00", status: "full" },
        { slot: "16:00 – 17:00", status: "fast" },
        { slot: "18:00 – 19:00", status: "available" }
      ]
    ];

    return patterns[day % patterns.length];
  }

  function getStatusLabel(status) {
    if (status === "available") return "Available";
    if (status === "fast") return "Filling Fast";
    return "Full";
  }

  function renderSlots(dateValue) {
    const slotData = getSlotStatusList(dateValue);

    slotGrid.innerHTML = slotData
      .map(
        (item) => `
          <button
            type="button"
            class="slot-chip ${item.status}"
            data-slot="${item.slot}"
            ${item.status === "full" ? "disabled" : ""}
          >
            ${item.slot}
            <span>${getStatusLabel(item.status)}</span>
          </button>
        `
      )
      .join("");

    attachSlotEvents();

    if (dateValue) {
      const dateObj = new Date(dateValue);
      const prettyDate = dateObj.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short"
      });
      slotDayLabel.textContent = `Availability for ${prettyDate}`;
    } else {
      slotDayLabel.textContent = "Select a date to view slot availability";
    }
  }

  function attachSlotEvents() {
    slotButtons().forEach((btn) => {
      if (btn.disabled) return;

      btn.addEventListener("click", () => {
        slotButtons().forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        const selectedSlot = btn.dataset.slot;
        if (selectedSlot) {
          timeSelect.value = selectedSlot;
        }
      });
    });
  }

  dateInput.addEventListener("change", () => {
    renderSlots(dateInput.value);
  });

  timeSelect.addEventListener("change", () => {
    const currentValue = timeSelect.value;
    slotButtons().forEach((b) => {
      b.classList.toggle("selected", b.dataset.slot === currentValue && !b.disabled);
    });
  });

  renderSlots(dateInput.value);
}
