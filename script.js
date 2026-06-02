const devices = [
  "firestick",
  "android-phone",
  "ios",
  "android-tv",
  "roku-tv"
];

const labels = {
  "firestick": "Firestick",
  "android-phone": "Android Phone",
  "ios": "IPhone / iPad",
  "android-tv": "Android TV",
  "roku-tv": "Roku TV"
};

function getDeviceFromHash() {
  const hash = window.location.hash.replace("#", "");
  return devices.includes(hash) ? hash : "firestick";
}

function hashIsDevice() {
  return devices.includes(window.location.hash.replace("#", ""));
}

function setDevice(device, shouldFocus = false) {
  document.querySelectorAll("[data-device]").forEach((tab) => {
    const isActive = tab.dataset.device === device;
    tab.setAttribute("aria-selected", String(isActive));
    tab.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  document.querySelectorAll("[data-panel]").forEach((panel) => {
    const isActive = panel.dataset.panel === device;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
    if (isActive && shouldFocus) {
      panel.focus({ preventScroll: true });
    }
  });
}

function wireInstructionTabs() {
  document.querySelectorAll("[data-device]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const device = tab.dataset.device;
      window.location.hash = device;
      setDevice(device, true);
    });

    tab.addEventListener("keydown", (event) => {
      const current = devices.indexOf(tab.dataset.device);
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const nextDevice = devices[(current + offset + devices.length) % devices.length];
      const nextTab = document.querySelector(`[data-device="${nextDevice}"]`);
      nextTab.focus();
      window.location.hash = nextDevice;
      setDevice(nextDevice);
    });
  });

  window.addEventListener("hashchange", () => {
    const isDeviceHash = hashIsDevice();
    setDevice(getDeviceFromHash(), isDeviceHash);
    if (isDeviceHash) {
      document.querySelector("#devices").scrollIntoView({ block: "start" });
    }
  });

  setDevice(getDeviceFromHash());
  if (hashIsDevice()) {
    window.requestAnimationFrame(() => {
      document.querySelector("#devices").scrollIntoView({ block: "start" });
    });
  }
}

function qrUrl(target) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(target)}`;
}

function wireCardBuilder() {
  const input = document.querySelector("[data-base-url]");
  const button = document.querySelector("[data-update-cards]");
  const sheet = document.querySelector("[data-print-sheet]");

  if (!input || !button || !sheet) {
    return;
  }

  function normalizeBaseUrl(value) {
    return value.trim().replace(/\/+$/, "") || `${window.location.origin}${window.location.pathname.replace(/cards\.html$/, "")}`;
  }

  function renderCards() {
    const base = normalizeBaseUrl(input.value);
    sheet.innerHTML = devices.map((device) => {
      const target = `${base}/#${device}`;
      return `
        <article class="business-card">
          <div class="card-copy">
            <div>
              <div class="card-logo">FLIX</div>
              <div class="card-device">${labels[device]}</div>
            </div>
            <p class="card-note">Scan for setup instructions. Open the app, go to Playlist or Account, then send a clear screenshot.</p>
            <div class="card-url">${target}</div>
          </div>
          <div class="qr-wrap">
            <img src="${qrUrl(target)}" alt="QR code for ${labels[device]} instructions">
          </div>
        </article>
      `;
    }).join("");
  }

  input.value = normalizeBaseUrl(input.value);
  button.addEventListener("click", renderCards);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      renderCards();
    }
  });
  renderCards();
}

function wireExampleModal() {
  const modal = document.querySelector("[data-example-modal]");
  const openButtons = document.querySelectorAll("[data-example-open]");
  const closeButton = document.querySelector("[data-example-close]");

  if (!modal || !openButtons.length || !closeButton) {
    return;
  }

  function openModal() {
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  }

  function closeModal() {
    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function boostChooseDeviceCta() {
  const cta = document.querySelector(".attention-pulse");

  if (!cta) {
    return;
  }

  if (typeof cta.animate !== "function") {
    let step = 0;
    const frames = [
      {
        transform: "translateY(0) scale(1)",
        boxShadow: "0 0 0 0 rgba(225, 124, 255, 0.62), 0 14px 30px rgba(184, 71, 217, 0.24)"
      },
      {
        transform: "translateY(-8px) scale(1.14)",
        boxShadow: "0 0 0 12px rgba(225, 124, 255, 0.13), 0 0 42px rgba(225, 124, 255, 0.9), 0 22px 46px rgba(184, 71, 217, 0.5)"
      },
      {
        transform: "translateY(0) scale(1.04)",
        boxShadow: "0 0 0 7px rgba(225, 124, 255, 0.1), 0 0 30px rgba(225, 124, 255, 0.72), 0 18px 38px rgba(184, 71, 217, 0.42)"
      },
      {
        transform: "translateY(-2px) scale(1.07)",
        boxShadow: "0 0 0 10px rgba(225, 124, 255, 0.12), 0 0 38px rgba(225, 124, 255, 0.84), 0 20px 42px rgba(184, 71, 217, 0.46)"
      }
    ];

    window.setInterval(() => {
      const frame = frames[step % frames.length];
      cta.style.transform = frame.transform;
      cta.style.boxShadow = frame.boxShadow;
      step += 1;
    }, 260);
    return;
  }

  cta.animate(
    [
      {
        transform: "translateY(0) scale(1)",
        boxShadow: "0 0 0 0 rgba(225, 124, 255, 0.62), 0 14px 30px rgba(184, 71, 217, 0.24)"
      },
      {
        transform: "translateY(-8px) scale(1.14)",
        boxShadow: "0 0 0 12px rgba(225, 124, 255, 0.13), 0 0 42px rgba(225, 124, 255, 0.9), 0 22px 46px rgba(184, 71, 217, 0.5)",
        offset: 0.24
      },
      {
        transform: "translateY(0) scale(1.04)",
        offset: 0.42
      },
      {
        transform: "translateY(-2px) scale(1.07)",
        boxShadow: "0 0 0 12px rgba(225, 124, 255, 0.13), 0 0 42px rgba(225, 124, 255, 0.9), 0 22px 46px rgba(184, 71, 217, 0.5)",
        offset: 0.58
      },
      {
        transform: "translateY(0) scale(1)",
        boxShadow: "0 0 0 0 rgba(225, 124, 255, 0.62), 0 14px 30px rgba(184, 71, 217, 0.24)"
      }
    ],
    {
      duration: 1350,
      easing: "ease-in-out",
      iterations: Infinity
    }
  );
}

wireInstructionTabs();
wireCardBuilder();
wireExampleModal();
boostChooseDeviceCta();
