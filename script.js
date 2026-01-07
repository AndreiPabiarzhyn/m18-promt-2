// script.js
(() => {
  const promptArea = document.getElementById("promptArea");
  const copyBtn = document.getElementById("copyBtn");
  const toastEl = document.getElementById("toast");
  const tabs = Array.from(document.querySelectorAll(".tab"));

  // chooser elements
  const chooser = document.getElementById("chooser");
  const chooserTitle = document.getElementById("chooserTitle");
  const chooserOptions = document.getElementById("chooserOptions");
  const customInput = document.getElementById("customInput");
  const cancelBtn = document.getElementById("cancelBtn");
  const applyBtn = document.getElementById("applyBtn");

  // copy modal elements (fallback for Genially iframe)
  const copyModal = document.getElementById("copyModal");
  const copyTextarea = document.getElementById("copyTextarea");
  const copyModalClose = document.getElementById("copyModalClose");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const closeBtn2 = document.getElementById("closeBtn2");

  // Templates: prompt lines with embedded chips
  const CONFIG = {
    character: {
      title: "Персонаж",
      chips: {
        hero: ["котик", "щенок", "зайчик", "медвежонок", "единорог", "робот"],
        style: ["мультяшный", "акварель", "пластилин", "детская книга", "стикер", "3D-игрушка"],
        mood: ["весёлое", "доброе", "смелое", "удивлённое", "сонное", "волшебное"],
        colors: ["яркие", "пастельные", "тёплые", "холодные", "радужные", "чёрно-белые"],
        extra: ["в шляпе", "с рюкзаком", "с шариком", "в очках", "с короной", "с крыльями"],
        bg: ["прозрачный", "без фона", "небо", "лес", "комната", "город"]
      },
      lines: [
        `Нарисуй {hero} как главного героя.`,
        `Стиль: {style}. Настроение: {mood}.`,
        `Цвета: {colors}.`,
        `Дополнительно: {extra}.`,
        `Фон вокруг героя: {bg}.`,
        `Картинка для детской книжки: простые формы, чёткие линии, без текста, высокое качество.`
      ]
    },
    background: {
      title: "Фон",
      chips: {
        place: ["лес", "город", "замок", "пляж", "космос", "школа"],
        time: ["утро", "день", "вечер", "ночь", "закат", "рассвет"],
        style: ["мультяшный", "акварель", "детская книга", "пастельный", "аппликация", "3D-мир"],
        mood: ["волшебное", "спокойное", "праздничное", "таинственное", "радостное", "уютное"],
        details: ["радуга", "звёзды", "фонарики", "снежинки", "цветы", "облака"],
        camera: ["широкий кадр", "панорама", "вид сверху", "на уровне глаз", "далеко", "середина сцены"]
      },
      lines: [
        `Нарисуй фон для детской книжки: {place}.`,
        `Время: {time}. Настроение: {mood}.`,
        `Стиль: {style}.`,
        `Добавь детали: {details}.`,
        `Камера: {camera}.`,
        `Фон без персонажей, чисто и красиво, мягкий свет, без текста, высокое качество.`
      ]
    }
  };

  // current state (selected values)
  let currentTemplate = "character";
  const state = {
    character: {
      hero: "котик",
      style: "мультяшный",
      mood: "весёлое",
      colors: "яркие",
      extra: "в шляпе",
      bg: "прозрачный",
    },
    background: {
      place: "лес",
      time: "день",
      style: "детская книга",
      mood: "уютное",
      details: "звёзды",
      camera: "широкий кадр",
    }
  };

  // chooser runtime
  let activeKey = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function chipHTML(key) {
    const value = state[currentTemplate][key] || "";
    const display = value.trim() ? value : "нажми";
    const isEmpty = !value.trim();
    return `<span class="chip ${isEmpty ? "empty" : ""}" data-key="${escapeHtml(key)}">
      <span class="val">${escapeHtml(display)}</span>
      <span class="caret">▾</span>
    </span>`;
  }

  function renderPrompt() {
    const tpl = CONFIG[currentTemplate];
    const htmlLines = tpl.lines.map((line) => {
      const withChips = line.replace(/\{([a-z_]+)\}/g, (_, key) => chipHTML(key));
      return `<p class="line">${withChips}</p>`;
    }).join("");

    promptArea.innerHTML = htmlLines;

    promptArea.querySelectorAll(".chip").forEach((el) => {
      el.addEventListener("click", () => openChooser(el));
    });
  }

  function setTemplate(name) {
    currentTemplate = name;

    tabs.forEach((b) => {
      const active = b.dataset.template === name;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    renderPrompt();
  }

  function openChooser(chipEl) {
    activeKey = chipEl.dataset.key;

    const tpl = CONFIG[currentTemplate];
    const options = (tpl.chips[activeKey] || []).slice();
    const current = (state[currentTemplate][activeKey] || "").trim();

    chooserTitle.textContent = "Выбери вариант";
    chooserOptions.innerHTML = "";
    customInput.value = "";

    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "optBtn" + (opt === current ? " selected" : "");
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        chooserOptions.querySelectorAll(".optBtn").forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
        customInput.value = "";
      });
      chooserOptions.appendChild(btn);
    });

    chooser.classList.add("open");
    chooser.setAttribute("aria-hidden", "false");
    setTimeout(() => customInput.focus(), 0);
  }

  function closeChooser() {
    chooser.classList.remove("open");
    chooser.setAttribute("aria-hidden", "true");
    activeKey = null;
  }

  function applyChooser() {
    if (!activeKey) return;

    const typed = (customInput.value || "").trim();
    if (typed) {
      state[currentTemplate][activeKey] = typed;
      renderPrompt();
      closeChooser();
      return;
    }

    const selectedBtn = chooserOptions.querySelector(".optBtn.selected");
    if (selectedBtn) {
      state[currentTemplate][activeKey] = selectedBtn.textContent.trim();
      renderPrompt();
      closeChooser();
      return;
    }

    closeChooser();
  }

  function getPlainPromptText() {
    const tpl = CONFIG[currentTemplate];
    const values = state[currentTemplate];

    return tpl.lines.map((line) =>
      line.replace(/\{([a-z_]+)\}/g, (_, key) => values[key] ? values[key] : "...")
    ).join("\n");
  }

  // ===== Genially/iframe friendly copy =====
  function fallbackCopyExecCommand(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }

    document.body.removeChild(textarea);
    return ok;
  }

  function openCopyModal(text) {
    if (!copyModal || !copyTextarea) {
      showToast("Не удалось скопировать");
      return;
    }

    copyTextarea.value = text;
    copyModal.classList.add("open");
    copyModal.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      copyTextarea.focus();
      copyTextarea.select();
    }, 0);
  }

  function closeCopyModal() {
    if (!copyModal) return;
    copyModal.classList.remove("open");
    copyModal.setAttribute("aria-hidden", "true");
  }

  function copyPromptText() {
    const text = getPlainPromptText();

    // 1) try execCommand copy (best chance in Genially iframe)
    const ok = fallbackCopyExecCommand(text);

    if (ok) {
      showToast("Промпт скопирован");
      return;
    }

    // 2) fallback: manual modal
    openCopyModal(text);
  }

  // ===== Auto-scale (optional) =====
  function autoScaleInit() {
    const fitWrap = document.getElementById("fitWrap");
    if (!fitWrap) return;

    const BASE_W = 1100;
    const BASE_H = 620;

    function fit() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pad = 12;

      const raw = Math.min((w - pad) / BASE_W, (h - pad) / BASE_H);
      const scale = Math.floor(raw * 100) / 100; // reduce blur

      fitWrap.style.transform = `scale(${scale})`;
    }

    window.addEventListener("resize", fit);
    fit();
    setTimeout(fit, 50);
    setTimeout(fit, 200);
    setTimeout(fit, 600);
  }

  // events
  tabs.forEach((btn) => btn.addEventListener("click", () => setTemplate(btn.dataset.template)));

  if (copyBtn) copyBtn.addEventListener("click", copyPromptText);

  if (cancelBtn) cancelBtn.addEventListener("click", closeChooser);
  if (applyBtn) applyBtn.addEventListener("click", applyChooser);

  if (chooser) chooser.addEventListener("click", (e) => {
    if (e.target === chooser) closeChooser();
  });

  if (copyModalClose) copyModalClose.addEventListener("click", closeCopyModal);
  if (closeBtn2) closeBtn2.addEventListener("click", closeCopyModal);

  if (selectAllBtn) selectAllBtn.addEventListener("click", () => {
    if (!copyTextarea) return;
    copyTextarea.focus();
    copyTextarea.select();
  });

  if (copyModal) copyModal.addEventListener("click", (e) => {
    if (e.target === copyModal) closeCopyModal();
  });

  window.addEventListener("keydown", (e) => {
    // chooser
    if (chooser && chooser.classList.contains("open")) {
      if (e.key === "Escape") closeChooser();
      if (e.key === "Enter") applyChooser();
    }
    // copy modal
    if (copyModal && copyModal.classList.contains("open")) {
      if (e.key === "Escape") closeCopyModal();
    }
  });

  // init
  setTemplate("character");
  autoScaleInit();
})();
